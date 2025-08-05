#import "DroidDex.h"

@implementation DroidDex

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup
{
    return NO;
}

RCT_EXPORT_METHOD(initialize:(NSDictionary *)config
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)
{
    // Return default iOS initialization result
    NSDictionary *result = @{
        @"success": @YES,
        @"fullFunctionality": @NO,
        @"missingPermissions": @[],
        @"missingOptionalPermissions": @[],
        @"apiLevel": @0,
        @"networkMonitoringSupported": @NO,
        @"batteryStatsSupported": @NO
    };
    resolve(result);
}

RCT_EXPORT_METHOD(getPerformanceLevel:(NSArray *)performanceClasses
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)
{
    // Return default HIGH performance level for iOS
    NSDictionary *result = @{
        @"level": @"HIGH",
        @"metrics": @{},
        @"timestamp": @([[NSDate date] timeIntervalSince1970] * 1000),
        @"supportedClasses": @[],
        @"unsupportedClasses": performanceClasses ?: @[]
    };
    resolve(result);
}

RCT_EXPORT_METHOD(getWeightedPerformanceLevel:(NSArray *)weightedParams
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)
{
    // Return default HIGH performance level for iOS
    NSDictionary *result = @{
        @"level": @"HIGH",
        @"metrics": @{},
        @"timestamp": @([[NSDate date] timeIntervalSince1970] * 1000),
        @"supportedClasses": @[],
        @"unsupportedClasses": @[]
    };
    resolve(result);
}

RCT_EXPORT_METHOD(startMonitoring:(NSArray *)performanceClasses
                  interval:(NSInteger)intervalMs
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)
{
    // Return a fake monitoring ID for iOS
    NSString *monitoringId = [[NSUUID UUID] UUIDString];
    resolve(monitoringId);
}

RCT_EXPORT_METHOD(startWeightedMonitoring:(NSArray *)weightedParams
                  interval:(NSInteger)intervalMs
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)
{
    // Return a fake monitoring ID for iOS
    NSString *monitoringId = [[NSUUID UUID] UUIDString];
    resolve(monitoringId);
}

RCT_EXPORT_METHOD(stopMonitoring:(NSString *)monitoringId
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)
{
    // Always return true for iOS
    resolve(@YES);
}

RCT_EXPORT_METHOD(stopAllMonitoring:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)
{
    // Always return true for iOS
    resolve(@YES);
}

RCT_EXPORT_METHOD(getPlatformInfo:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)
{
    NSDictionary *info = @{
        @"platform": @"ios",
        @"supported": @NO,
        @"version": [[NSProcessInfo processInfo] operatingSystemVersionString]
    };
    resolve(info);
}

@end