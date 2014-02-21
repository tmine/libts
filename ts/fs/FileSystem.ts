window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
window.storageInfo = window.storageInfo || window.webkitStorageInfo;
window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;

class Filesystem{
	private static filesystem;
	
	private static init(success, error) : void{
		if(Filesystem.filesystem) return;
		
		var size = 5*1024*1024;
		if(window.storageInfo){
			window.storageInfo.requestQuota(window.PERSISTENT, size, function(gb) {
				window.requestFileSystem(window.PERSISTENT, gb, success, error);
			}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
			} else {
				window.requestFileSystem(window.PERSISTENT, size, success, error);
			}
		
	}
	
	public static readAllFiles(success, error){
		function toArray(list) {
			return Array.prototype.slice.call(list || [], 0);
		}
		Filesystem.init(function(fs){
			var dirReader = fs.root.createReader();
			var entries = [];
			var files = [];
			
			// Call the reader.readEntries() until no more results are returned.
			var readEntries = function() {
				dirReader.readEntries (function(results) {
					if (!results.length) {
						console.log(entries);
						for(var i=0; i<entries.length; i++){
							var entry = entries[i];
							if(entry.isFile) files.push(entry.name);
						}
						if(success) success(files);
					} else {
						entries = entries.concat(toArray(results));
						readEntries();
					}
				}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
			};
			readEntries(); // Start reading dirs.
		}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
	}
	
	public static writeFile(path : string, data : any, success, error) : void{
		function write(){
			Filesystem.init(function(fs){
				fs.root.getFile(path, {create: true}, function(fileEntry) {
			        fileEntry.createWriter(function(writer) {
			            writer.write(data);
						if(success) success();
			        }, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
			    }, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
			}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
		}
		Filesystem.removeFile(path, write, write);
	}
	
	public static readFile(path, success, error) {
	    Filesystem.init(function(fs){
			fs.root.getFile(path, {}, function(fileEntry) {
		        fileEntry.file(function(file) {
		            var reader = new FileReader();
		            reader.onloadend = function(e) {
		                if (success) success(this.result);
		            };
		            reader.readAsText(file);
		        }, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
		    }, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
		}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
	}
	
	public static removeFile(path, success, error){
		Filesystem.init(function(fs){
			fs.root.getFile(path, {create: false}, function(fileEntry) {
				fileEntry.remove(function() {
					if(success) success();
				}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
			}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
		}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
	}
	
	private static FsErrorHandler(e) {
	    var msg = '';
	
	    switch (e.code) {
	        case FileError.QUOTA_EXCEEDED_ERR:
	            msg = 'QUOTA_EXCEEDED_ERR';
	            break;
	        case FileError.NOT_FOUND_ERR:
	            msg = 'NOT_FOUND_ERR';
	            break;
	        case FileError.SECURITY_ERR:
	            msg = 'SECURITY_ERR';
	            break;
	        case FileError.INVALID_MODIFICATION_ERR:
	            msg = 'INVALID_MODIFICATION_ERR';
	            break;
	        case FileError.INVALID_STATE_ERR:
	            msg = 'INVALID_STATE_ERR';
	            break;
	        default:
	            msg = 'Unknown Error';
	            break;
	    };
	
	    console.log('Error: ' + msg);
	}
}
