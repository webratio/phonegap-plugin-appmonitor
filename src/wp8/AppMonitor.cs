using Microsoft.Phone.Info;
using System.Runtime.Serialization;
using WPCordovaClassLib.Cordova;
using WPCordovaClassLib.Cordova.Commands;
using WPCordovaClassLib.Cordova.JSON;

namespace Cordova.Extension.Commands
{
	public class AppMonitor : BaseCommand
	{
		public void supportsMemoryInfo(string optionsStr) {
			var callbackId = JsonHelper.Deserialize<string[]>(optionsStr)[0];
			DispatchCommandResult(new PluginResult(PluginResult.Status.OK, "true"), callbackId);    		
		}

		public void getMemoryInfo(string optionsStr) {
			var callbackId = JsonHelper.Deserialize<string[]>(optionsStr)[0];
            var info = new MemoryInfo() {
                limit = DeviceStatus.ApplicationMemoryUsageLimit,
				used = DeviceStatus.ApplicationCurrentMemoryUsage
			};
			DispatchCommandResult(new PluginResult(PluginResult.Status.OK, info), callbackId);    		
		}
		
		[DataContract]
		public class MemoryInfo
		{
            [DataMember] public long limit;
			[DataMember] public long used;
		}
    }
}