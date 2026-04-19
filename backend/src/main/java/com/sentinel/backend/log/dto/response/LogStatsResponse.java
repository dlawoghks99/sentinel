package com.sentinel.backend.log.dto.response;

import java.util.Map;

public record LogStatsResponse(long totalCount
                             , long errorCount
                             , double avgResponseTimeMs
                             , LevelDistribution levelDistribution
                             , Map<String, Long> serviceDistribution
                             , ResponseTimeBuckets responseTimeDistribution) {
    public record LevelDistribution(
            long info,
            long warn,
            long error
    ) {
        public static LevelDistribution empty() {
            return new LevelDistribution(0L, 0L, 0L);
        }
    }

    public record ResponseTimeBuckets(
            long fast,
            long normal,
            long slow
    ) {
        public static ResponseTimeBuckets empty() {
            return new ResponseTimeBuckets(0L, 0L, 0L);
        }
    }
}
