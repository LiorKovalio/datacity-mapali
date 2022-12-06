import os

import dataflows as DF

from dgp.core.base_enricher import enrichments_flows, BaseEnricher
from dgp.core import BaseAnalyzer
from dgp.config.consts import RESOURCE_NAME, CONFIG_URL, CONFIG_PUBLISH_ALLOWED
from dgp.config.log import logger
from dataflows_aws import dump_to_s3

import hashlib

BUCKET_NAME = os.environ['MAPS_S3_BUCKET_NAME']
ENDPOINT_URL = os.environ['MAPS_S3_ENDPOINT_URL']
REGION_NAME = os.environ['MAPS_S3_REGION_NAME']
ACCESS_KEY_ID = os.environ['MAPS_S3_ACCESS_KEY_ID']
SECRET_ACCESS_KEY = os.environ['MAPS_S3_SECRET_ACCESS_KEY']


class MyS3Dumper(dump_to_s3):

    def __init__(self, bucket, acl, *args, **kwargs):
        super().__init__(bucket, acl, *args, **kwargs)
        self.datapackage_props = kwargs.get('datapackage_props', {})

    def write_file_to_output(self, filename, path):
        logger.error('WRITING {} to {}'.format(filename, path))
        super().write_file_to_output(filename, path, allow_create_bucket=False)

    def handle_datapackage(self):
        self.datapackage.descriptor.update(self.datapackage_props)
        self.datapackage.commit()
        return super().handle_datapackage()
        

class PathSetter(BaseAnalyzer):
    def run(self):
        hashstr = self.config.get(CONFIG_URL)
        if hashstr is not None:
            hashstr = hashlib.md5(hashstr.encode('utf-8')).hexdigest()[:16]
            self.config.set('mapPath', hashstr)
            logger.error('CALCULATED HASH {}'.format(hashstr))


class BucketDumper(BaseEnricher):
    def test(self):
        return True

    def bounds(self, props):
        props.setdefault('bounds', [[None, None],[None, None]])
        def func(row):
            if row['location-lon'] is None or row['location-lat'] is None:
                return
            if props['bounds'][0][0] is None or row['location-lon'] < props['bounds'][0][0]:
                props['bounds'][0][0] = float(row['location-lon'])
            if props['bounds'][0][1] is None or row['location-lat'] < props['bounds'][0][1]:
                props['bounds'][0][1] = float(row['location-lat'])
            if props['bounds'][1][0] is None or row['location-lon'] > props['bounds'][1][0]:
                props['bounds'][1][0] = float(row['location-lon'])
            if props['bounds'][1][1] is None or row['location-lat'] > props['bounds'][1][1]:
                props['bounds'][1][1] = float(row['location-lat'])
        return func

    def postflow(self):
        hashstr = self.config.get('mapPath')
        if hashstr is not None:

            props = dict()

            publishing = self.config.get(CONFIG_PUBLISH_ALLOWED, False)
            cache_control = 'public, max-age=31536000' if publishing else 'no-cache'

            return DF.Flow(
                DF.update_resource(RESOURCE_NAME, path='data.geojson'),
                DF.add_field('geometry', 'geopoint', lambda r: (r['location-lon'], r['location-lat'])),
                self.bounds(props),
                MyS3Dumper(BUCKET_NAME, 'public-read', hashstr, 
                    format='geojson',
                    content_type='application/geo+json',
                    cache_control=cache_control,
                    region_name=REGION_NAME,
                    endpoint_url=ENDPOINT_URL, aws_access_key_id=ACCESS_KEY_ID, aws_secret_access_key=SECRET_ACCESS_KEY,
                    datapackage_props=props
                ),
                DF.delete_fields(['geometry']),
            )

class UpdatePackage(BaseEnricher):
    def test(self):
        return True

    def postflow(self):
        return DF.Flow(
            DF.update_package(
                **self.config._unflatten().get('package', {})
            )
        )


def analyzers(config, context):
    return [
        PathSetter
    ]


def flows(config, context):
    return enrichments_flows(
        config, context,
        UpdatePackage,
        BucketDumper
    )
