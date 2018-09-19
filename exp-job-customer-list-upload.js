Polymer({
  is: 'exp-job-customer-list-upload',
  properties: {
    exportJobObj: {
      type: Object,
      notify: true
    },
    editDtFrm: Boolean
  },
  behaviors: [Flytxt.TemplateHelper, Flytxt.webL10n, Flytxt.DropdownFix, Flytxt.UserBehavior, Flytxt.ErrorMessageBehavior],
  observers: ['setUploadFile(editDtFrm, exportJobObj.sourceType, exportJobObj.sourceId)', 'resetUploadFile(exportJobObj.sourceType)'],
  attached: function() {
    var me = this;
    me.async(function() {
      me.uploadEventListner();
    });
  },
  setUploadFile: function(editDtFrm, sourceType, srcId) {
    if (editDtFrm && sourceType === 1 && srcId) {
      var cstmListUpload = this.$.cstmListUpload;
      cstmListUpload.files = this.exportJobObj.dataFrameConfig.uploadFiles;
    }
  },
  uploadEventListner: function() {
    var me = this;
    var cstmListUpload = this.$.cstmListUpload;
    cstmListUpload.addEventListener('upload-before', me.uploadBefore);
    cstmListUpload.addEventListener('upload-response', me.uploadResponse.bind(me));
  },
  uploadBefore: function(event) {
    var file = event.detail.file;
    // Custom upload request url for file
    file.uploadTarget = '/neon-ws/uploadFile/';
    // Custom name in the Content-Disposition header
    file.formDataName = 'filename';
  },
  uploadResponse: function(event) {
    var me = this;
    var xhr = event.detail.xhr;
    if (xhr.readyState === 4 && xhr.status === 200) {
      if (xhr.response === '-999') {
        app.showToast(me.webL10n(me.l10n, 'exception.STORE_NOT_CONFIGURED'));
        return false;
      }
      me.set('exportJobObj.sourceId', xhr.response);
      var uploadFiles = [];
      var file = event.detail.file;
      var uploadFile = {'name': file.name, 'progress': file.progress, 'complete': file.complete};
      uploadFiles.push(uploadFile);
      me.set('exportJobObj.dataFrameConfig.uploadFiles', uploadFiles);
    }
    if (xhr.status === 500) {
      app.showToast(xhr.statusText);
    }
    // event.detail.file.error = 'Custom server error message.';
  }
});
