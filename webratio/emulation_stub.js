function createStubs() {
	var supported = !!(window.performance && window.performance.memory);
	
	return {
		AppMonitor: {
			
			supportsMemoryInfo: function() {
				return supported;
			},
			
			getMemoryInfo: function() {
				if (!supported) {
					throw new Error("Memory information not supported");
				}
				return {
					limit: window.performance.memory.jsHeapSizeLimit,
					used: window.performance.memory.usedJSHeapSize
				}
			}
			
		}
	};
};