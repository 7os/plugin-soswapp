/*! 7OS -Web plugin: https://github.com/7os/plugin-soswapp
  ! Requires 7os/theme-soswapp available @ https://github.com/7os/theme-soswapp
  ! Requires 7os/js-generic-soswapp available @ https://github.com/7os/js-generic-soswapp
*/
if (typeof sos == 'undefined') window.sos = {}; // Seven OS
if ( typeof sos.config !== 'object' ) sos.config = {};
sos.alert = function(msg,opts){
  var options = {
    type : 'info',
    tymout : 0,
    exit : 'Okay'
  }
  msg = msg.replace(/\\r\\n/g,'<br>').replace(/\\n/g,'<br>');
  var optionVals = {
    type : ['info','message','error','progress','success'],
    exit : ['Okay','Close','Continue']
  }
  if( opts && typeof opts =='object' ){
    if (in_array(opts.type,optionVals.type)) options.type = opts.type;
    if (opts.exit !== undefined) options.exit = opts.exit;
  }

  var typeMsgs = {
    info : 'Okay',
    message : 'Okay',
    error : 'Close',
    progress : '',
    success : 'Continue'
  }
  var typeIcons = {
    info : ' <i class="fas fa-info fa-2x"></i> ',
    error : ' <i class="fas fa-times fa-2x"></i> ',
    success : ' <i class="fas fa-check fa-2x"></i> ',
    message : ' <i class="fas fa-info-circle fa-2x"></i> ',
    progress : ' <i class="fas fa-spinner fa-2x fa-spin"></i> '
  }
  var btnIcons = {
    info : ' <i class="fas fa-info-circle"></i> ',
    error : ' <i class="fas fa-times"></i> ',
    success : ' <i class="fas fa-check"></i> ',
    message : ' <i class="fas fa-arrow-right"></i> ',
    progress : ''
  }
  var btnColors = {
    info : 'yellow',
    error : 'red',
    success : 'green',
    message : 'white',
    progress : 'blue'
  }
  if( $(document).find('#sos-alert-cover').length > 0 ){ removeAlert(); }
  var div = '<div id="sos-alert-cover"> <div id="sos-alert" class="alert '+options.type+' drop-shadow"> <div id="sos-alert-content">';
      if( options.type == 'progress' ){
        div += ' <p class="align-c"> '+typeIcons[options.type]+'</p>';
      }
      div += msg;
      div += "</div> <footer>";
      if( options.type !== 'progress' && options.exit !== false ){
        if (typeof options.exit !== "boolean" || parseBool(options.exit) != false ) {
          if (in_array(options.exit,typeMsgs)) {
            div += '  <button type="button" class="btn '+btnColors[options.type]+'" onclick="removeAlert();">' + btnIcons[options.type] +typeMsgs[options.type] +'</button>'
          } else {
            div += '  <button type="button" class="sos-btn '+btnColors[options.type]+'" onclick="removeAlert();">' + btnIcons[options.type] + options.exit +'</button>'
          }
        }
      }
      div += '</footer> </div> </div>';
  $('body').prepend(div);
  $(document).find('#sos-alert-cover').animate({opacity:1},300);
  if( parseInt(options.tymout) > 0 ){  setTimeout(function(){ removeAlert(); },options.tymout); }
};
window.alert = sos.alert; // window.alert/alert is deprecated, you should say: sos.alert(message, options)
function removeAlert(){
  var div = $(document).find('#sos-alert-cover');
  if( div.length >0){
    div.animate({opacity:0},300,function(){ div.remove(); });
  }
}
sos.form = {
  submit : function (form, callback, validate, resetForm, header) {
    if (validate && !sos.form.validate.all(form)) {
      console.error("Form was not submitted due to validation error(s)");
      return false;
    }
    var requestMethod = $(form).attr("method").toLowerCase();
    if (requestMethod == 'get' && $(form).find("input[type=file]").length > 0) {
      sos.alert('<h2>Wrong form request [method] </h2> <p>Kindly use \'POST\' [method] for forms with file upload.</p>',{type:"error"});
      return false;
    }
    if (requestMethod == 'get') {
      fData = $(form).serialize();
    } else {
      var fData = new FormData();
      var formId = $(form).attr('id');
      formId = ( typeof formId !== null && formId !== false ) ? formId : false;
      var formFiles = $(form).find('input[type=file]');
      var otherFormFiles = false;
      if( formFiles.length > 0 ){
        var fileInputs = form.querySelectorAll("input[type=file]");
        for(i = 0; i < fileInputs.length; ++ i){
          var fname='file-'+i+'-';
          for(ii = 0; ii < fileInputs[i].files.length; ++ii){
            fData.append(fname+ii,fileInputs[i].files[ii]);
          }
        }
      }
      var inputs = $(form).find('input'),
      checkboxes = $(form).find('input[type=checkbox]'),
      radios = $(form).find('input[type=radio]'),
      selects = $(form).find('select'),
      textareas = $(form).find('textarea');

      if( inputs.length >0 ){
        inputs.each(function() {
          if( !in_array($(this).attr('type'),['file','checkbox','radio']) ){
            fData.append($(this).attr('name'),$(this).val());
          }
        });
      }

      if( checkboxes.length > 0 ){
        checkboxes.each(function(){
          var name = $(this).attr('name');
          var cchecked = [];
          $(form).find("input[name="+name+"]").each(function(){
            if( $(this).is(':checked') ){
              cchecked.push( $(this).val() );
            }
          });

          if( cchecked.length > 0 ){
            fData.append( name , cchecked.join(',') );
          }
        });
      }

      if( radios.length > 0 ){
        radios.each(function(){
          if( $(this).is(':checked') ){
            fData.append( $(this).attr('name') , $(this).val() );
          }
        });
      }
      if( selects.length > 0 ){
        selects.each(function(){
          fData.append($(this).attr('name'),$(this).val());
        });
      }
      if( textareas.length > 0 ){
        textareas.each(function(){
          fData.append($(this).attr('name'),$(this).val());
        });
      }
      // process addition form element using form attribut
      if( formId ){
        // files
        otherFormFiles = $(document).find('input[name=file][form="'+formId+'"]');
        if( otherFormFiles.length > 0 ){
          var other_fileInputs = form.querySelectorAll('input[name=file][form="'+formId+'"]');
          for(i=0;i<other_fileInputs.length;++i){
            var fname='filex-'+i+'-';
            for(ii=0; ii<other_fileInputs[i].files.length; ++ii){
              fData.append(fname+ii,other_fileInputs[i].files[ii]);
            }
          }

        }
        var otherInputs      = $(document).find('input[form="'+formId+'"]'),
        otherRadios      = $(document).find('input[type=radio][form="'+formId+'"]'),
        otherCheckboxes  = $(document).find('input[type=checkbox][form="'+formId+'"]'),
        otherSelects     = $(document).find('select[form="'+formId+'"]'),
        otherTextareas   = $(document).find('textarea[form="'+formId+'"]');
        // input
        if( otherInputs.length >0 ){
          otherInputs.each(function() {
            if( !in_array($(this).attr('type'),['file','checkbox','radio']) ){
              fData.append($(this).attr('name'),$(this).val());
            }
          });
        }
        // checkbox
        if( otherCheckboxes.length > 0 ){
          otherCheckboxes.each(function(){
            if( $(this).is(':checked') ){
              fData.append( $(this).attr('name') , $(this).val() );
            }
          });
        }
        // radios
        if( otherRadios.length > 0 ){
          otherRadios.each(function(){
            if( $(this).is(':checked') ){
              fData.append( $(this).attr('name') , $(this).val() );
            }
          });
        }
        // select
        if( otherSelects.length > 0 ){
          otherSelects.each(function(){
            fData.append($(this).attr('name'),$(this).val());
          });
        }
        // textarea
        if( otherTextareas.length > 0 ){
          otherTextareas.each(function(){
            fData.append($(this).attr('name'),$(this).val());
          });
        }
      }
    }

    sos.alert("Please wait..",{type:'progress',exit:false});
    var actionDomain = $(form).data('domain') ?
          $(form).data('domain') :
          document.location.origin,
        actionPath = $(form).data('path') ?
          $(form).data('path') : '';
    var actionUrl = actionDomain + actionPath + $(form).attr('action');
    header = typeof header == 'object' ? header : {}
    var ajaxOpt = {
      url : actionUrl,
      type : requestMethod,
      headers : header,
      data : fData,
      contentType: false,
      processData: requestMethod == "post" ? false : true,
      xhr: function() {
         var xhr = $.ajaxSettings.xhr();
         if(xhr.upload){
         xhr.upload.addEventListener('progress', sos.loader.progress, false);
         }
         return xhr;
       },
       // beforeSend : function(req){
       //   if(header && typeof header == 'object'){
       //     $.each(header,function(i,v){
       //       req.setRequestHeader(i,v);
       //     });
       //   }
       // },
      success  : function(data){
        if(data.status !== undefined && (data.status == "0.0" || data.errors.length <= 0) ){
          // console.log(data);
          // $(form).trigger('reset');
          if(resetForm)  $(form).trigger('reset');
          sos.alert(data.message,{type:'success',tymout:18000});
          if(typeof callback == "function") { callback(data); };
        }else{
          // console.log(data);
          if (data.errors !== undefined && data.message !== undefined) {
            var html = '<h3>'+data.message+'</h3>';
            html += '<strong>Errors:</strong> <ol>';
            for(i=0;i<data.errors.length;i++){  html += '<li>'+data.errors[i]+'</li>'; }
            html += '</ol>';

            if( data.uploaded_files ){
              if( data.uploaded_files.length >0){
                html += '<strong>Uploaded Files:</strong><br><ol>';
                for(i=0;i<data.uploaded_files.length;i++){
                  html += '<li> <a href="'+data.uploaded_files[i].url+'" target="_blank" title="Click to view"> File '+i+'</a></li>';
                }
                html += '</ol>';
              }
            }
            if(data.failed_files ){
              if(data.failed_files.length >0){
                html += '<strong>Failed Files:</strong><br><ol>';
                for(i=0;i<data.failed_files.length;i++){
                  html += '<li> '+data.failed_files[i].name+' | Type: '+data.failed_files[i].type+' | Size in bytes: '+fromByte(data.failed_files[i].size)+'</li>';
                }
                html += '</ol>';
              }
            }
            sos.alert(html,{type: 'error'});
          } else {
            var outprint = " <h3>Response detail</h3>";
            if (typeof data == "object") {
              outprint += JSON.stringify(data);
            } else {
              outprint += data;
            }
            sos.alert(' <h2>Error(s) encountered</h2> <div>'+outprint+'</div>',{type:'error'});
          }
          // console.log(data);
        }
      },
      error		:	function(xhr, textStatus, errorThrown){
        //console.clear();
        var errorMessage = xhr.responseText;
        // errorMessage = ' ('+errorMessage.substring(errorMessage.indexOf('<title>') + 500, errorMessage.indexOf('</title>'))+')';
        // console.log(errorMessage);
        var html = '<h3>Sorry, error occured</h3> ';
        sos.alert(html+errorMessage,{type:'error'});
      }
    }

    // if( url.hostname() !== url.hostname(actionUrl) ){
    //   ajaxOpt['dataType'] = 'jsonp';
    //   ajaxOpt['jsonp'] = 'json';
    //   // ajaxOpt.async = true;
    // }else{
    //   ajaxOpt['dataType'] = 'json';
    // }
    ajaxOpt['dataType'] = 'json';
    $.ajax(ajaxOpt);
  }
};
// form processor
TFsubmitForm = sos.form.submit; //TFsubmitForm will soon be discontinued
sos.loader = {
  init : function(pauseActivity, wrapper) {
    if ($(document).find("#sos-loader").length <= 0 ) {
      pauseActivity = typeof pauseActivity == "boolean" ? pauseActivity : false;
      var outprint = '<div id="sos-loader"';
      if (pauseActivity) outprint += ' class="sos-loader-cover"';
          outprint += '> <div id="sos-spinner"> <i class="fas fa-spinner fa-spin"></i></div> <div id="sos-loader-loaded"></div>';
          outprint += '</div>';
      $('body').prepend(outprint);
    }
  },
  progress : function (info) {
    sos.loader.init();
    var bar = $(document).find('#sos-loader-loaded');
    var loaded = Math.round( ((info.loaded * 100) / info.total) );
    bar.css({
      width : loaded + "%"
    });
    if (loaded >= 100 ){
      setTimeout(sos.loader.exit,1200);
    }

  },
  exit : function () {
    $(document).find("#sos-loader").fadeOut('slow').remove();
  }
};
sos.form.validate = {
  all : function (form) {
    return true;
  }
};
