from dgp.core.base_enricher import enrichments_flows


def analyzers(config, context):
    return [
    ]

def flows(config, context):
    return enrichments_flows(
        config, context,
    )
