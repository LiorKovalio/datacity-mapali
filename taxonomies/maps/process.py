import os

import dataflows as DF

from dgp.core.base_enricher import enrichments_flows, BaseEnricher

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
    return []

def flows(config, context):
    return enrichments_flows(
        config, context,
        UpdatePackage
    )
