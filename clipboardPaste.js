if (!RedactorPlugins) var RedactorPlugins = {};

(function($) {
	RedactorPlugins.clipboardPaste = function() {
		return {
			init: function() {
				if (!this.opts.clipboardUploadUrl) return;
				if (!this.opts.clipboardUpload) return;

				this.$editor.on('paste.redactor', $.proxy(function(e) {

					var pasteEvent = e.originalEvent || e;		

					// Handle Firefox
					if ( this.utils.browser('mozilla') ) {
						// For some reason I needed this in a timeout or the editor wasn't updating with the latest HTML
						setTimeout( $.proxy( function() {
							
							if (this.opts.clipboardUpload) {
								
								// Find all images in the editor HTML which are inline base64 encoded	
								imgs = this.$editor.find("img[src*='data:image']");

								// Loop through each image and split the src attribute to get base64 data and mime-type
								$.each(imgs, $.proxy(function(i,s) {

									this.progress.show();
									
									var $s = $(s);
									var arr = s.src.split(",");
									var postData = {
										'contentType': arr[0].split(";")[0].split(":")[1],
										'data': arr[1] // raw base64
									};


									$.post(this.opts.clipboardUploadUrl, postData, $.proxy(function(data) {
										var json = (typeof data === 'string' ? $.parseJSON(data) : data);
							        	
										// Set the attibutes of the image
							        	$s.attr('src', json.filelink);
							        	$s.removeAttr('data-mozilla-paste-image');
							        	$s.attr( "data-redactor-inserted-image" , true );

							        	// If in linebreaks mode we need to append and prepend <BR> tags
							        	if( this.opts.linebreaks ) {
							        		$s.prepend('<br>').append('<br>');
							        	} else {
							        		// Otherwise make sure they're in P tags
							        		$s.wrap("<p></p>");
							        	}
							        	
							        	this.progress.hide();

									}, this)).always( $.proxy( function() {
					    				this.progress.hide();
									},this));
										
								}, this));
								
								this.code.sync();								
							}							

						} , this ) , 500);
						
						return true;	
					}			

					// Handle IE11
					if ( typeof( clipboardData ) != 'undefined') {
						var fileList = clipboardData.files;
						if( fileList && fileList.length) {
				            var file = fileList[0];
				            var url = URL.createObjectURL(file);
				            event.msConvertURL(file, "specified", url);
				            
							this.progress.show();

							var reader = new FileReader();

							reader.onload = $.proxy( this.clipboardPaste.pasteClipboardUploadIE, this );
					        reader.readAsDataURL(file);

					        e.preventDefault();

					        return true;
				        }
					}					

					// Handle Chrome & Opera
					if ( typeof( pasteEvent.clipboardData ) === 'undefined' ) return;

					if ( pasteEvent.clipboardData.items ) {

						/* For Chrome and Opera we need to create a fake image first to retain the current caret posisiont. For the life of me I can't get the caret position through the proxy */
						e.stopPropagation();
						var img = document.createElement('img');					
						img.alt = "clipboard-image-marker";
						img.setAttribute( "data-redactor-inserted-image" , true );

						/* Get the current caret position, insert the fake image and set the caret after the new node */
						this.selection.get();
						this.range.deleteContents();
						this.range.insertNode( img );
						this.caret.setAfter( img );
						
						var file = pasteEvent.clipboardData.items[0].getAsFile();

						if (file !== null) {
							this.progress.show();
							var reader = new FileReader();							
							reader.onload = $.proxy( this.clipboardPaste.pasteClipboardUpload, this );
					        reader.readAsDataURL(file);							        			        					        
						} else {
							/* Get rid of the fake image if we didn't have files */
							this.progress.hide();
							$( $.find('img[alt="clipboard-image-marker"]') ).remove();							
						}
						
						return true;
					}


				}, this));

			},
			pasteClipboardUploadIE: function(e) {
				var result = e.target.result;
				var arr = result.split(",");
				var postData = {
					'contentType': arr[0].split(";")[0].split(":")[1],
					'data': arr[1] // raw base64
				};

				if ( this.opts.clipboardUpload ) {
					
					$.post( this.opts.clipboardUploadUrl, postData, $.proxy(function(data) {
						var json = (typeof data === 'string' ? $.parseJSON(data) : data);
						
						this.insert.html( "<img src='" + json.filelink + "' data-redactor-inserted-image='true' id='clipboard-image-marker'/>" );

						var image = $(this.$editor.find('img#clipboard-image-marker'));

						if (image.length) {
							image.removeAttr('id');
						} else {
							image = false;
						}

						this.code.sync();
						this.progress.hide();			
						

					}, this)).always( $.proxy( function() {
	    				this.progress.hide();

					},this));
				} else {
		        	this.insert.html('<img src="' + result + '" />');
		        	this.progress.hide();
	        	}
			},
			pasteClipboardUpload: function(e) {
				
		        var result = e.target.result;
				var arr = result.split(",");
				var postData = {
					'contentType': arr[0].split(";")[0].split(":")[1],
					'data': arr[1] // raw base64
				};

				if ( this.opts.clipboardUpload ) {
					
					$.post( this.opts.clipboardUploadUrl, postData, $.proxy(function(data) {
						var json = (typeof data === 'string' ? $.parseJSON(data) : data);

						var image = $(this.$editor.find('img[alt="clipboard-image-marker"]'));
						
						if (image.length) {							
							image.attr('src',json.filelink);
							image.removeAttr('alt');
						}

						this.code.sync();
						this.progress.hide();	
						return true;

					}, this)).always( $.proxy( function() {
	    				this.progress.hide();

					},this));
				} else {
		        	this.insert.html('<img src="' + result + '" />');
		        	this.progress.hide();
	        	}
			}
		};
	};
})(jQuery);