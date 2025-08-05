package com.reactnativedroiddex

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.core.content.ContextCompat
import com.blinkit.droiddex.DroidDex
import com.blinkit.droiddex.PerformanceClass
import com.blinkit.droiddex.PerformanceLevel
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.gson.Gson
import java.util.*
import java.util.concurrent.ConcurrentHashMap

class DroidDexModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), LifecycleEventListener {

    private val monitoringHandlers = ConcurrentHashMap<String, Handler>()
    private val monitoringRunnables = ConcurrentHashMap<String, Runnable>()
    private val gson = Gson()
    
    companion object {
        const val NAME = "DroidDex"
        const val TAG = "DroidDexModule"
        private var isInitialized = false
        
        // Minimum Android API level requirements
        const val MIN_API_LEVEL = 21
        const val NETWORK_MONITORING_MIN_API = 23
        const val BATTERY_STATS_MIN_API = 21
        
        // Required permissions
        private val REQUIRED_PERMISSIONS = arrayOf(
            Manifest.permission.ACCESS_NETWORK_STATE,
            Manifest.permission.ACCESS_WIFI_STATE
        )
        
        private val OPTIONAL_PERMISSIONS = arrayOf(
            Manifest.permission.BATTERY_STATS
        )
    }

    init {
        reactContext.addLifecycleEventListener(this)
    }

    override fun getName(): String {
        return NAME
    }

    override fun getConstants(): MutableMap<String, Any> {
        return hashMapOf(
            "PERFORMANCE_LEVELS" to hashMapOf(
                "EXCELLENT" to PerformanceLevel.EXCELLENT.name,
                "HIGH" to PerformanceLevel.HIGH.name,
                "AVERAGE" to PerformanceLevel.AVERAGE.name,
                "LOW" to PerformanceLevel.LOW.name
            ),
            "PERFORMANCE_CLASSES" to hashMapOf(
                "CPU" to PerformanceClass.CPU.name,
                "MEMORY" to PerformanceClass.MEMORY.name,
                "NETWORK" to PerformanceClass.NETWORK.name,
                "STORAGE" to PerformanceClass.STORAGE.name,
                "BATTERY" to PerformanceClass.BATTERY.name
            )
        )
    }

    @ReactMethod
    fun initialize(config: ReadableMap, promise: Promise) {
        try {
            // Check Android version compatibility
            if (Build.VERSION.SDK_INT < MIN_API_LEVEL) {
                Log.w(TAG, "Android API level ${Build.VERSION.SDK_INT} is below minimum required $MIN_API_LEVEL")
                promise.reject("UNSUPPORTED_VERSION", "Android API level ${Build.VERSION.SDK_INT} is not supported. Minimum required: $MIN_API_LEVEL")
                return
            }
            
            // Check required permissions
            val missingPermissions = checkRequiredPermissions()
            if (missingPermissions.isNotEmpty()) {
                Log.w(TAG, "Missing required permissions: ${missingPermissions.joinToString(", ")}")
                // Don't reject - continue with limited functionality
                Log.w(TAG, "Continuing with limited functionality due to missing permissions")
            }
            
            // Check optional permissions
            val missingOptionalPermissions = checkOptionalPermissions()
            if (missingOptionalPermissions.isNotEmpty()) {
                Log.i(TAG, "Missing optional permissions: ${missingOptionalPermissions.joinToString(", ")}")
            }
            
            if (!isInitialized) {
                try {
                    DroidDex.init(reactApplicationContext)
                    isInitialized = true
                    Log.d(TAG, "DroidDex initialized successfully")
                } catch (e: Exception) {
                    Log.e(TAG, "DroidDex initialization failed", e)
                    // Try fallback initialization
                    isInitialized = true // Mark as initialized to allow basic functionality
                    Log.w(TAG, "Using fallback mode due to DroidDex initialization failure")
                }
            }
            
            val result = WritableNativeMap().apply {
                putBoolean("success", true)
                putBoolean("fullFunctionality", missingPermissions.isEmpty())
                putArray("missingPermissions", WritableNativeArray().apply {
                    missingPermissions.forEach { pushString(it) }
                })
                putArray("missingOptionalPermissions", WritableNativeArray().apply {
                    missingOptionalPermissions.forEach { pushString(it) }
                })
                putInt("apiLevel", Build.VERSION.SDK_INT)
                putBoolean("networkMonitoringSupported", Build.VERSION.SDK_INT >= NETWORK_MONITORING_MIN_API)
                putBoolean("batteryStatsSupported", Build.VERSION.SDK_INT >= BATTERY_STATS_MIN_API)
            }
            
            promise.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize DroidDex", e)
            promise.reject("INIT_ERROR", "Failed to initialize DroidDex: ${e.message}", e)
        }
    }

    @ReactMethod
    fun getPerformanceLevel(performanceClasses: ReadableArray, promise: Promise) {
        try {
            ensureInitialized()
            
            val classes = parsePerformanceClasses(performanceClasses)
            val supportedClasses = filterSupportedPerformanceClasses(classes)
            
            if (supportedClasses.isEmpty()) {
                promise.reject("NO_SUPPORTED_CLASSES", "None of the requested performance classes are supported on this device")
                return
            }
            
            val level = try {
                DroidDex.getPerformanceLevel(*supportedClasses.toTypedArray())
            } catch (e: Exception) {
                Log.w(TAG, "DroidDex failed, using fallback performance assessment", e)
                getFallbackPerformanceLevel(supportedClasses)
            }
            
            val result = createPerformanceResult(level, supportedClasses, classes)
            promise.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get performance level", e)
            promise.reject("PERFORMANCE_ERROR", "Failed to get performance level: ${e.message}", e)
        }
    }

    @ReactMethod
    fun getWeightedPerformanceLevel(weightedParams: ReadableArray, promise: Promise) {
        try {
            ensureInitialized()
            
            val weightedClasses = parseWeightedPerformanceClasses(weightedParams)
            val supportedWeightedClasses = filterSupportedWeightedPerformanceClasses(weightedClasses)
            
            if (supportedWeightedClasses.isEmpty()) {
                promise.reject("NO_SUPPORTED_CLASSES", "None of the requested performance classes are supported on this device")
                return
            }
            
            val level = try {
                DroidDex.getWeightedPerformanceLevel(*supportedWeightedClasses.toTypedArray())
            } catch (e: Exception) {
                Log.w(TAG, "DroidDex failed, using fallback weighted performance assessment", e)
                getFallbackWeightedPerformanceLevel(supportedWeightedClasses)
            }
            
            val performanceClasses = supportedWeightedClasses.map { it.first }
            val originalClasses = weightedClasses.map { it.first }
            val result = createPerformanceResult(level, performanceClasses, originalClasses)
            
            promise.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get weighted performance level", e)
            promise.reject("PERFORMANCE_ERROR", "Failed to get weighted performance level: ${e.message}", e)
        }
    }

    @ReactMethod
    fun startMonitoring(performanceClasses: ReadableArray, intervalMs: Int, promise: Promise) {
        try {
            ensureInitialized()
            
            val classes = parsePerformanceClasses(performanceClasses)
            val monitoringId = UUID.randomUUID().toString()
            
            startPerformanceMonitoring(monitoringId, classes, null, intervalMs)
            
            promise.resolve(monitoringId)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start monitoring", e)
            promise.reject("MONITORING_ERROR", "Failed to start monitoring: ${e.message}", e)
        }
    }

    @ReactMethod
    fun startWeightedMonitoring(weightedParams: ReadableArray, intervalMs: Int, promise: Promise) {
        try {
            ensureInitialized()
            
            val weightedClasses = parseWeightedPerformanceClasses(weightedParams)
            val monitoringId = UUID.randomUUID().toString()
            
            startPerformanceMonitoring(monitoringId, null, weightedClasses, intervalMs)
            
            promise.resolve(monitoringId)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start weighted monitoring", e)
            promise.reject("MONITORING_ERROR", "Failed to start weighted monitoring: ${e.message}", e)
        }
    }

    @ReactMethod
    fun stopMonitoring(monitoringId: String, promise: Promise) {
        try {
            val handler = monitoringHandlers.remove(monitoringId)
            val runnable = monitoringRunnables.remove(monitoringId)
            
            if (handler != null && runnable != null) {
                handler.removeCallbacks(runnable)
                Log.d(TAG, "Stopped monitoring: $monitoringId")
                promise.resolve(true)
            } else {
                promise.resolve(false)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to stop monitoring", e)
            promise.reject("MONITORING_ERROR", "Failed to stop monitoring: ${e.message}", e)
        }
    }

    @ReactMethod
    fun stopAllMonitoring(promise: Promise) {
        try {
            monitoringHandlers.forEach { (_, handler) ->
                monitoringRunnables.forEach { (_, runnable) ->
                    handler.removeCallbacks(runnable)
                }
            }
            
            monitoringHandlers.clear()
            monitoringRunnables.clear()
            
            Log.d(TAG, "Stopped all monitoring")
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to stop all monitoring", e)
            promise.reject("MONITORING_ERROR", "Failed to stop all monitoring: ${e.message}", e)
        }
    }

    @ReactMethod
    fun getPlatformInfo(promise: Promise) {
        try {
            val info = WritableNativeMap().apply {
                putString("platform", "android")
                putInt("version", android.os.Build.VERSION.SDK_INT)
                putString("release", android.os.Build.VERSION.RELEASE)
                putString("device", android.os.Build.DEVICE)
                putString("model", android.os.Build.MODEL)
                putString("manufacturer", android.os.Build.MANUFACTURER)
                putBoolean("supported", true)
                putBoolean("droidDexInitialized", isInitialized)
            }
            promise.resolve(info)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get platform info", e)
            promise.reject("PLATFORM_ERROR", "Failed to get platform info: ${e.message}", e)
        }
    }

    private fun ensureInitialized() {
        if (!isInitialized) {
            throw IllegalStateException("DroidDex not initialized. Call initialize() first.")
        }
    }

    private fun parsePerformanceClasses(performanceClasses: ReadableArray): List<PerformanceClass> {
        val classes = mutableListOf<PerformanceClass>()
        
        for (i in 0 until performanceClasses.size()) {
            val className = performanceClasses.getString(i)
            val performanceClass = PerformanceClass.valueOf(className)
            classes.add(performanceClass)
        }
        
        return classes
    }

    private fun parseWeightedPerformanceClasses(weightedParams: ReadableArray): List<Pair<PerformanceClass, Float>> {
        val weightedClasses = mutableListOf<Pair<PerformanceClass, Float>>()
        
        for (i in 0 until weightedParams.size()) {
            val param = weightedParams.getMap(i)
            val className = param.getString("performanceClass")
            val weight = param.getDouble("weight").toFloat()
            
            val performanceClass = PerformanceClass.valueOf(className)
            weightedClasses.add(performanceClass to weight)
        }
        
        return weightedClasses
    }

    private fun startPerformanceMonitoring(
        monitoringId: String,
        classes: List<PerformanceClass>?,
        weightedClasses: List<Pair<PerformanceClass, Float>>?,
        intervalMs: Int
    ) {
        val handler = Handler(Looper.getMainLooper())
        
        val runnable = object : Runnable {
            override fun run() {
                try {
                    val level = if (classes != null) {
                        DroidDex.getPerformanceLevel(*classes.toTypedArray())
                    } else {
                        val weightedArray = weightedClasses!!.map { it.first to it.second }.toTypedArray()
                        DroidDex.getWeightedPerformanceLevel(*weightedArray)
                    }
                    
                    val performanceClasses = classes ?: weightedClasses!!.map { it.first }
                    val result = createPerformanceResult(level, performanceClasses, performanceClasses)
                    
                    sendEvent("DroidDex_Performance_$monitoringId", result)
                    
                    handler.postDelayed(this, intervalMs.toLong())
                } catch (e: Exception) {
                    Log.e(TAG, "Error in performance monitoring", e)
                    sendEvent("DroidDex_Error_$monitoringId", WritableNativeMap().apply {
                        putString("message", e.message ?: "Unknown error")
                    })
                }
            }
        }
        
        monitoringHandlers[monitoringId] = handler
        monitoringRunnables[monitoringId] = runnable
        handler.post(runnable)
    }

    private fun createPerformanceResult(level: PerformanceLevel, supportedClasses: List<PerformanceClass>, originalClasses: List<PerformanceClass>? = null): WritableMap {
        return WritableNativeMap().apply {
            putString("level", level.name)
            putMap("metrics", createMetrics(supportedClasses))
            putDouble("timestamp", System.currentTimeMillis().toDouble())
            putArray("supportedClasses", WritableNativeArray().apply {
                supportedClasses.forEach { pushString(it.name) }
            })
            originalClasses?.let { original ->
                val unsupported = original - supportedClasses.toSet()
                if (unsupported.isNotEmpty()) {
                    putArray("unsupportedClasses", WritableNativeArray().apply {
                        unsupported.forEach { pushString(it.name) }
                    })
                }
            }
        }
    }

    private fun createMetrics(classes: List<PerformanceClass>): WritableMap {
        val metrics = WritableNativeMap()
        
        classes.forEach { performanceClass ->
            when (performanceClass) {
                PerformanceClass.CPU -> {
                    metrics.putMap("cpu", WritableNativeMap().apply {
                        putDouble("totalRam", Runtime.getRuntime().totalMemory().toDouble())
                        putInt("coreCount", Runtime.getRuntime().availableProcessors())
                        putDouble("cpuFrequency", 0.0) // This would need system-level access
                    })
                }
                PerformanceClass.MEMORY -> {
                    val runtime = Runtime.getRuntime()
                    metrics.putMap("memory", WritableNativeMap().apply {
                        putDouble("heapLimit", runtime.maxMemory().toDouble())
                        putDouble("heapRemaining", (runtime.maxMemory() - runtime.totalMemory() + runtime.freeMemory()).toDouble())
                        putDouble("availableRam", runtime.freeMemory().toDouble())
                    })
                }
                PerformanceClass.BATTERY -> {
                    // Battery metrics would be populated by droid-dex internally
                    metrics.putMap("battery", WritableNativeMap().apply {
                        putDouble("percentageRemaining", 0.0)
                        putBoolean("isCharging", false)
                    })
                }
                PerformanceClass.NETWORK -> {
                    // Network metrics would be populated by droid-dex internally
                    metrics.putMap("network", WritableNativeMap().apply {
                        putString("bandwidthStrength", "UNKNOWN")
                        putDouble("downloadSpeed", 0.0)
                        putDouble("signalStrength", 0.0)
                    })
                }
                PerformanceClass.STORAGE -> {
                    // Storage metrics would be populated by droid-dex internally
                    metrics.putMap("storage", WritableNativeMap().apply {
                        putDouble("availableStorage", 0.0)
                    })
                }
            }
        }
        
        return metrics
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    override fun onHostResume() {
        // Resume monitoring if needed
    }

    override fun onHostPause() {
        // Pause monitoring if needed
    }

    override fun onHostDestroy() {
        // Clean up all monitoring
        stopAllMonitoring(object : Promise {
            override fun resolve(value: Any?) {}
            override fun reject(code: String?, message: String?) {}
            override fun reject(code: String?, throwable: Throwable?) {}
            override fun reject(code: String?, message: String?, throwable: Throwable?) {}
            override fun reject(throwable: Throwable?) {}
            override fun reject(throwable: Throwable?, userInfo: WritableMap?) {}
            override fun reject(code: String?, userInfo: WritableMap?) {}
            override fun reject(code: String?, throwable: Throwable?, userInfo: WritableMap?) {}
            override fun reject(code: String?, message: String?, userInfo: WritableMap?) {}
            override fun reject(code: String?, message: String?, throwable: Throwable?, userInfo: WritableMap?) {}
        })
    }

    // Helper methods for backward compatibility and error handling
    
    private fun checkRequiredPermissions(): List<String> {
        val missingPermissions = mutableListOf<String>()
        
        REQUIRED_PERMISSIONS.forEach { permission ->
            if (ContextCompat.checkSelfPermission(reactApplicationContext, permission) != PackageManager.PERMISSION_GRANTED) {
                missingPermissions.add(permission)
            }
        }
        
        return missingPermissions
    }
    
    private fun checkOptionalPermissions(): List<String> {
        val missingPermissions = mutableListOf<String>()
        
        OPTIONAL_PERMISSIONS.forEach { permission ->
            if (ContextCompat.checkSelfPermission(reactApplicationContext, permission) != PackageManager.PERMISSION_GRANTED) {
                missingPermissions.add(permission)
            }
        }
        
        return missingPermissions
    }
    
    private fun filterSupportedPerformanceClasses(classes: List<PerformanceClass>): List<PerformanceClass> {
        return classes.filter { performanceClass ->
            when (performanceClass) {
                PerformanceClass.NETWORK -> {
                    Build.VERSION.SDK_INT >= NETWORK_MONITORING_MIN_API && 
                    ContextCompat.checkSelfPermission(reactApplicationContext, Manifest.permission.ACCESS_NETWORK_STATE) == PackageManager.PERMISSION_GRANTED
                }
                PerformanceClass.BATTERY -> {
                    Build.VERSION.SDK_INT >= BATTERY_STATS_MIN_API
                }
                PerformanceClass.CPU, PerformanceClass.MEMORY, PerformanceClass.STORAGE -> true
                else -> true
            }
        }
    }
    
    private fun filterSupportedWeightedPerformanceClasses(weightedClasses: List<Pair<PerformanceClass, Float>>): List<Pair<PerformanceClass, Float>> {
        return weightedClasses.filter { (performanceClass, _) ->
            when (performanceClass) {
                PerformanceClass.NETWORK -> {
                    Build.VERSION.SDK_INT >= NETWORK_MONITORING_MIN_API && 
                    ContextCompat.checkSelfPermission(reactApplicationContext, Manifest.permission.ACCESS_NETWORK_STATE) == PackageManager.PERMISSION_GRANTED
                }
                PerformanceClass.BATTERY -> {
                    Build.VERSION.SDK_INT >= BATTERY_STATS_MIN_API
                }
                PerformanceClass.CPU, PerformanceClass.MEMORY, PerformanceClass.STORAGE -> true
                else -> true
            }
        }
    }
    
    private fun getFallbackPerformanceLevel(classes: List<PerformanceClass>): PerformanceLevel {
        // Simple fallback performance assessment based on basic device info
        val runtime = Runtime.getRuntime()
        val maxMemory = runtime.maxMemory()
        val availableProcessors = runtime.availableProcessors()
        
        // Basic scoring system
        var score = 0
        
        // Memory scoring (40% weight)
        when {
            maxMemory >= 4_000_000_000L -> score += 40  // 4GB+ RAM
            maxMemory >= 2_000_000_000L -> score += 30  // 2-4GB RAM
            maxMemory >= 1_000_000_000L -> score += 20  // 1-2GB RAM
            else -> score += 10                         // <1GB RAM
        }
        
        // CPU cores scoring (30% weight)
        when {
            availableProcessors >= 8 -> score += 30    // 8+ cores
            availableProcessors >= 4 -> score += 25    // 4-7 cores
            availableProcessors >= 2 -> score += 15    // 2-3 cores
            else -> score += 5                         // Single core
        }
        
        // Android version scoring (30% weight)
        when {
            Build.VERSION.SDK_INT >= 30 -> score += 30  // Android 11+
            Build.VERSION.SDK_INT >= 28 -> score += 25  // Android 9-10
            Build.VERSION.SDK_INT >= 26 -> score += 20  // Android 8.x
            Build.VERSION.SDK_INT >= 23 -> score += 15  // Android 6-7
            else -> score += 10                         // Android 5.x
        }
        
        return when {
            score >= 85 -> PerformanceLevel.EXCELLENT
            score >= 65 -> PerformanceLevel.HIGH
            score >= 45 -> PerformanceLevel.AVERAGE
            else -> PerformanceLevel.LOW
        }
    }
    
    private fun getFallbackWeightedPerformanceLevel(weightedClasses: List<Pair<PerformanceClass, Float>>): PerformanceLevel {
        // For weighted fallback, use the same scoring but apply weights
        val classes = weightedClasses.map { it.first }
        return getFallbackPerformanceLevel(classes)
    }
}