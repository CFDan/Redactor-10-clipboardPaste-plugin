# Redactor-10-clipboardPaste-plugin
Plugin for Redactor 10 to allow pasting of images inline and upload the data via ajax

### To use

~~~
<script src="redactor/redactor.js"></script>
<script src="clipboardPaste.js"></script>

<script type="text/javascript">
$(function()
{
    $('#content').redactor({
        focus: true,
        plugins: ["clipboardPaste"],
        clipboardUploadUrl: "clipboardUploadUrl.cfm",
        clipboardUpload: true
    });
});
</script>
~~~

### Parameters

`clipboardUploadUrl` is a file that accepts the data and creates a URL for the file to be inserted in Redactor. This can be from your own server or from S3.

This should receive 2 FORM vars `data` and `contentType`

`contentType` is the mime-type of the image pasted in. `data` is the base64 encoded data of the image

Return a JSON packet with `filelink` pointing to the URL of the uploaded file which is returned to the plug-in

### Supported browsers

- IE11
- Chrome
- Opera
- Firefox
