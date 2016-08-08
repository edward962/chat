var $mainForm;
var baseURL="http://localhost:50633/";
var debug=false;
var query = window.location.search.substring(1);
var $analyzeTab,$searchResultContainer;
var folderName="ImageProcessor";
var db;
var rootDir;
var key1='';
var key2='';
var accessKey=null;

if(query.indexOf("debug=true")>-1){
    debug=true;
}else{ 
    baseURL="http://WebApp820160720.azurewebsites.net/";
}



$(function () {

    //prebind variables
    $mainForm = $("#main-form");
    $analyzeTab=$('#tab-content-2');
    $searchResultContainer=$('#search-result-container');

    //when that button is clicked, its going to pass its click along to the actual button
    $mainForm.find('#upload-button').click( function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (window.fileChooser && false) {
            alert('filechooser');
            fileChooser.open(submitFormWithImageURI);
        } else {
            
            //$file.click();
            navigator.camera.getPicture(
                submitFormWithImageURI,
                function(){},
                { quality:50,
                    destinationType: navigator.camera.DestinationType.NATIVE_URI ,
                    sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM 
                 }
            )
        }
    });


    //ASYNC FORM CONTAINER
    $mainForm.submit(function (e) {
        e.preventDefault();

        return false;
    });


    //SET UP THE TABS
    $('.tab')
        .each(function (tabNumber) {
            $(this).data('number', tabNumber);
        })
        .click(function () {
            $this=$(this);

            if($this.data('number')==2){
                
                refreshReviewTab();

            }
            $('.tab, .tab-content').removeClass('selected');
            $('#tab-content-' + $(this)
                .addClass('selected')
                .data('number')).addClass('selected');
        });


});



//=========================================================================================================================
//                                            REFRESH REVIEW TAB
//=========================================================================================================================

function refreshReviewTab(){
    
    refreshSearchResults();

    //now add populate the filter
    db.executeSql('SELECT name,tag_labels.id FROM tag_labels',[],function(res){
        if(res.rows.length>0){
            for(var i=0;i<res.rows.length;i++){
                row=res.rows.item(i);
                $("<li>"+row['name']+"</li>")
                    .click(function(){
                        $(this).toggleClass('selected');
                        refreshSearchResults();
                    })
                    .data('tag-id',row['id'])
                    .appendTo('#tag-filter');
            }  
        }
    });
}

function refreshSearchResults(){

    tagList=[];
    //figure out which tags are selected
    $('#tag-filter li.selected').each(function(){
        tagList=$(this).data('tag-id');
        console.log(tagId);
    });

    if(tagList.length>0){
        var tagBlock='';
        for(var i=0;i<tagList.length;i++){
            if(i>0) tagBlock+=",";
            tagBlock+="?";
        }
        db.executeSql('SELECT group_id, image_groups.name AS group_name,images.name AS name,images.file FROM tag_values' +
            'LEFT JOIN images ON tag_values.image_id=images.id '+
            'LEFT JOIN image_groups ON image_groups.id=images.group_id '+
            'WHERE tag_values.tag_label_id IN ('+tagBlock+') ORDER BY images.group_id DESC, images.number_in_group ASC',tagList,populateResults,function(error){console.error(error)});
    }else{
        db.executeSql('SELECT group_id, image_groups.name AS group_name,images.name AS name,images.file FROM images,image_groups WHERE images.group_id=image_groups.id ORDER BY images.group_id DESC',[],populateResults,function(error){console.error(error)});
    }
}


function populateResults(result){
    var listContent='';
    var lastGroupId=0;

    if(result.rows.length>0){
        for(var i=0;i<result.rows.length;i++){
            row=result.rows.item(i);


            //create each group
            var groupId=row['group_id'];
            if(groupId!=lastGroupId){

                if(listContent) listContent+="</div>";
                listContent+="<div class='stored-group'>";
                listContent+="<h2>"+row['group_name']+"</h2>";
                lastGroupId=groupId;
            
            }
            
            listContent+="<img src='"+row['file']+"'>";   
        }
        listContent+="</div>";

    }else{
        listContent="<p>You haven't saved anything yet!</p>"
    }

    //now actually add the html
    $searchResultContainer.html(listContent);
}


//=========================================================================================================================
//                                            FORM RESULTS
//=========================================================================================================================
function formResults(data) {
    data=JSON.parse(data.response);
    console.log(data);
    $('.image-group, #image-group-container .button').remove();
    //$imageGroup = $data.find('.image-group').prependTo('#tab-content-1');
    $imageGroup=$("<div class='image-group'></div>");
    
    
    //get the key pair for this image
    key1=data.key1;
    key2=data.key2;

    var setCount=data.setCount;
    for(var i=0;i<setCount;i++){
        imageCount=data["set"+i+"_imageCount"];
        //$imagesGroup.append('<h2>'++'</h2>')
        for(var j=0;j<imageCount;j++){
            $image=$("<div class='image-container'></div>");
            imageJson=data["set"+i+"_image"+j];
            var imageUrl=baseURL+'home/FetchImage/'+key2+'/'+imageJson.ImageName+".jpg";
            $image.append('<img src="'+imageUrl+'">');
            $image.append("<p class='type'><span>"+imageJson.ImageType+"</span></p>");
            $image.appendTo($imageGroup);
        }

        //take care of the composite
        if(data["set"+i].CompositeFile){
            var imageUrl=baseURL+'home/FetchImage/'+key2+'/'+data["set"+i].CompositeFile;
            $imageGroup.data('composite',imageUrl);
        }
    }
    $imageGroup.appendTo('#image-group-container');

    bindImageInteractions();

    $('#key1').val(key1);
    $('#key2').val(key2);

    unHideForm();

    $("#createThreadWithImg").css('visibility',"visible");

}


function unHideForm(){
    $mainForm.attr("disabled", false);
    $mainForm.show();
    $('.preview-image').hide();
    $('.loading-gif').hide();
}


//=========================================================================================================================
//                                            BIND IMAGE INTERACTIONS
//=========================================================================================================================
//here we hook up the share button
function bindImageInteractions() {

    var size= $('.image-container').size();
    
    if(!size) return;

    $shareButton=$("<a id='share-button' class='button'>Share</a>").click(function () {

        var size= $('.image-container').size();
        $imageGroup = $('.image-group');
        if(size){

            //hide and show the appropriate images
            if(size>1){
                $(".multi-share").show();
            }else{
                $(".multi-share").hide();
            }

            //animate in the screens
            $("#window-shade").fadeIn(500);
            $("#share-screen").slideDown(500);

        }
    }).appendTo('#image-group-container').after($("<a id='save-button' class='button'>Save</a>").click(function () {

            var size= $('.image-container').size();
            $imageGroup = $('.image-group');
            if(size){

                //hide and show the appropriate images
                if(size>1){
                    $(".multi-save").show();
                }else{
                    $(".multi-save").hide();
                }

                //animate in the screens
                $("#window-shade").fadeIn(500);
                $("#save-screen").slideDown(500);

            }
        })
    );


    
    if(size){
        $("#reset-form").slideDown(500);
    }else{
        $("#reset-form").hide();
    }

}
//=========================================================================================================================
//                                           Form Helper Functions
//=========================================================================================================================


function disableFormDuringUpload() {
    $mainForm.attr("disabled", true);
    $('.loading-gif').show();
    $mainForm.hide();
}

function addImageFormData(){
        //add extra data to the form
    $('.image-form-data').remove();

    //attach the image group state data
    $imageGroups = $('.image-group');
    $("<input type='hidden' name='groupCount' class='image-form-data'>").val($imageGroups.size()).appendTo($mainForm);
    if ($imageGroups.size()) {
        $imageGroups.each(function (i) {
            $(this).find('.image-container').each(function (j) {
                $this = $(this);
                $("<input type='hidden' name='imageArray[" + i + "][" + j + "][src]' class='image-form-data'>").val($this.find('img').attr('src')).appendTo($mainForm);
                $("<input type='hidden' name='imageArray[" + i + "][" + j + "][type]' class='image-form-data'>").val($this.find('p.type span').text()).appendTo($mainForm);
            });
        });
    }
}

//=========================================================================================================================
//                                            Submit the image to the server
//=========================================================================================================================

function submitFormWithImageURI(imageURI) {

    //now we're going to upload the form
    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
    options.mimeType = "image/jpeg";
    //options.mimeType="text/plain";
    options.headers = {
        Connection: "close"
    };
    var params = new Object();

    //add the current state data.  Once there's a database this won't be needed
    addImageFormData();

    $mainForm
        .find('input')
        .not('input[type="file"]')
        .each(function () {
            $input = $(this);
            if($input.attr('name')){
                params[$input.attr('name')] = $input.val();
            }
        });

    options.params = params;
    options.chunkedMode = false;
    
    var ft = new FileTransfer();
    ft.upload(imageURI, encodeURI(getProcessingURL()),
        function (uploadResult) {
            formResults(uploadResult)
        },
        function(error){
        switch (error.code)
    {  
     case FileTransferError.FILE_NOT_FOUND_ERR: 
      alert("Photo file not found"); 
      break; 
     case FileTransferError.INVALID_URL_ERR: 
      alert("Bad Photo URL"); 
      break; 
     case FileTransferError.CONNECTION_ERR: 
      alert("Connection error"); 
      break; 
    } 

    unHideForm();

    },options,true);

    disableFormDuringUpload();

}


//===================
//  returns the key
//===================
function getProcessingURL(){
    //$mainForm.attr("action")
    return baseURL+accessKey+"/process";
}


//=========================================================================================================================
//                  ON DEVICE READY
//=========================================================================================================================
function onDeviceReady() {
    /*AndroidFullScreen.immersiveMode(function(){

    });*/

    //Keyboard.hideFormAccessoryBar(true);

    //for any images that are already in there
    bindImageInteractions();

    //use js for camera
    if (navigator.camera){
        $("#camera-button").click(function (e) {

            //do this for cordova
            e.preventDefault();
            e.stopPropagation();

            navigator.camera.getPicture(
                submitFormWithImageURI,
                function (message) { alert('failure:' + message); },
                { destinationType: navigator.camera.DestinationType.FILE_URI }
                )
        });
    }

    //bind the share button
    $("#window-shade, .popup").hide();


    //make it so that the windowshade gets rid
    $("#window-shade").click(function(){
        $("#window-shade, .popup").hide();
    });

    //bind the actual share buttons
    $("#share-screen .button").each(function(i){
        $(this).data('which',i).click(shareButtonAction);
    });

    //bind the actual save buttons
    $("#save-screen .button").each(function(i){
        $(this).data('which',i).click(saveButtonAction);
    });

    //allow the backbutton to close the sharing popup
    document.addEventListener('backbutton', function(e) {
        $("#window-shade, .popup").hide();
    });

    //hide/show the reset button
    bindImageInteractions();

    //bind the reset button
    $("#reset-button").click(function(){
        var imageCount=$('.image-container').size();

        //we hide instead of remove for complete sets to preserve them on the server
        if(imageCount==1){
            $('.image-group').remove();
        }else{
            $('.image-group').hide();
        }

        $("#reset-form").hide();
        
    });


    //deal with the online offline stuff
    $("#reload-button").click(updateOnlineOffline);
    updateOnlineOffline();

    $.ajax({type:'POST',url:baseURL+'login',data:{key:'ZOORCR9cyTOZ1p9smcOLHBFMk0ZMsTPc3GywhVAyLiUaczGWox'},
        success:function(data){
            console.log(data)

            if(!data.success){
                setOffline(true);
            }else{
                accessKey=data.useKey;
            }
            //get rid of the loading screen
            $("#loading").fadeOut(200);
        }
    });

    //load up our full path
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){

        console.log('got file system access')


        var directoryEntry = fileSystem.root; // to get root path of directory

        rootDir = fileSystem.root.toURL();
        console.log(rootDir)
        rootDir = rootDir+"/"+ folderName + "/" ; // fullpath and name of the file which we want to give
    });

    //create the database
    //window.sqlitePlugin.deleteDatabase({name:"image_processor.db",location:'default'});
    if(!db) db=window.sqlitePlugin.openDatabase({name:"image_processor.db",location:'default'});
    db.transaction(function(t){

        t.executeSql('CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, value TEXT)',[],
            function(t,result){
                //add the first setting 
                if(result.rowsAffected){
                    t.executeSql('INSERT INTO settings (name, value) VALUES (?,?)', ['db-version','1'],null,e);
                }
            },
        e);

        //create the image groups
        t.executeSql('CREATE TABLE IF NOT EXISTS image_groups (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, process_date DATETIME)',[],null,e);
        t.executeSql('CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, group_id INTEGER, number_in_group INTEGER, name TEXT, file TEXT)',[],null,e);
        t.executeSql('CREATE TABLE IF NOT EXISTS tag_labels (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE)',[],null,e);
        t.executeSql('CREATE TABLE IF NOT EXISTS tag_values (id INTEGER PRIMARY KEY AUTOINCREMENT, tag_label_id INTEGER, image_id INTEGER, value TEXT )',[],null,e);
        console.log('created all of them');
    },function(error){
            console.error('there was an error in the creation');
            console.error(error)
    });



    //CHAT
    initChat();


}



function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
function updateOnlineOffline(){
    //figure out the online/offline thing
    var isOffline = 'onLine' in navigator && !navigator.onLine;
    setOffline(isOffline);
}

function setOffline(isOffline){
    if(isOffline){
        $(".offline-content").show();
        $(".online-content").hide();
    }else{
        $(".offline-content").hide();
        $(".online-content").show();
    }
}

function shareButtonAction(){

    //don't bother if the plugin isn't present
    if (!window.plugins || !window.plugins.socialsharing) return;

    $this=$(this);
    $imageGroup=$('.image-group');
    var number=$this.data('which');
    
    //share one of the images
    var shareImage='';
    var shareText='';
    if(number<2){
        $imageContainer=$($imageGroup.find('.image-container')[number]);
        shareText="Image Type:" +$imageContainer.find('p.type span').text()
        shareImage=$imageContainer.find('img').attr('src');
    }else{
        $imageContainers=$imageGroup.find('.image-container');
        shareText="Left Image Type:" +$($imageContainers[0]).find('p.type span').text();
        shareText+="\nRight Image Type:" +$($imageContainers[1]).find('p.type span').text();
        shareImage=$imageGroup.data('composite');
    }
    
    window.plugins.socialsharing.share(shareText , "Results from The Image Processor", shareImage);
}

function saveButtonAction(){

    //don't bother if the plugin isn't present
    if (!window.plugins || !window.plugins.socialsharing) return;

    $this=$(this);
    $imageGroup=$('.image-group');
    var number=$this.data('which');
    
    //share one of the images
    var shareImage='';
    var shareText='';

    var name="image";
    if(number>1) name="image group?";
    var nickname= window.prompt("What would you like to nickname this "+name);
    //var nickname='test'
    save(number,nickname);
}


function e(t,e){
    console.error(e);
}

//which is 1-3
function save(which,nickname){

        //create the group
        db.executeSql('INSERT INTO image_groups (name,process_date) VALUES (?,strftime("%s","now"))',[nickname],function(result){
            group=result.insertId;

            console.log("Group Id:"+group);

            var start=0;
            if(which<2) start=which;

            //save the images
            for(var i=start;i<which+1;i++){
                var fileName=group+"_"+i+".jpg";
                var imageURL='';

                //if its 2, use the composite image


                if(i<2){
                    imageURL=encodeURI($($('.image-group img').get(i)).attr("src"));
                }else{
                    imageURL=$('.image-group').data('composite');
                }

                //do the download
                downloadImage(fileName,imageURL);
                imageId=0;

                //load up the tags
                console.log('going into the tags for image '+i);

                (function(group,number,nickname,theFile){
                    console.log('in the tag function')
                    db.executeSql('INSERT INTO images (group_id, number_in_group, name,file) VALUES (?,?,?,?)',[group, number, nickname, theFile],function(image_res){
                        imageId=image_res.insertId;
                        console.log('tags for image:'+number);
                        //now add all of the images tags
                        var start=0;
                        var taData='';
                        if(number<2) start=number;
                        var separator='';

                        for(var i=start;i<number+1;i++){
                            tagData+=separator;
                            tagData+=$($('.image-container').get(i)).find('.type').text();
                            separator='|';
                        }

                        tags=tagData.split("|");
                        for(var j=0;j<tags.length;j++){
                            tag=tags[j].split(":");
                            console.log('tag for image '+number+":"+tag[0]+":"+tag[1]);
                            addTag(imageId,tag[0],tag[1]);
                        }
                    },e);
                })(group,i,nickname,rootDir+"/"+fileName);

            };

            
        },function(t,error){
            console.error('there was an error');
            console.error(error)
        });


    //});

    $('.popup, #window-shade').hide();
}

function addTag(imageId,tagName,tagValue){
    

    db.executeSql('INSERT OR IGNORE INTO tag_labels (name) VALUES (?)',[tagName],function(res){
        console.log('added tag:'+res.rowsAffected);

        //now get the tag id
        db.executeSql('SELECT id FROM tag_labels WHERE name LIKE ?',[tagName],function(labelResult){
            console.log('foudn it I guess');
            console.log(labelResult);
            attachTagValue(imageId,labelResult.rows.item(0)['id'],tagValue);
        },e);
    },e);
    


}

function attachTagValue(imageId,tagId,tagValue){
    console.log('tag found');
    db.executeSql('INSERT INTO tag_values (tag_label_id,image_id,value) VALUES (?,?,?)',[tagId,imageId,tagValue],null,e);
}


function downloadImage(fileName,imageURL){
window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){

    console.log('got file system access')


    var directoryEntry = fileSystem.root; // to get root path of directory

    var rootdir = fileSystem.root;
    var fp = rootdir.toURL(); // Returns Fulpath of local directory

    directoryEntry.getDirectory(fp+"/"+folderName, { create: true, exclusive: false }); // creating folder in sdcard


    fp = fp+"/"+ folderName + "/" + fileName; // fullpath and name of the file which we want to give

    // download function call
    var ft = new FileTransfer();
    ft.download(imageURL, fp,    function(entry) {
            console.log("download complete: " + entry.toURL());
            refreshMedia.refresh(entry.toURL());
        },
        function(error) {
            console.log("download error source " + error.source);
            console.log("download error target " + error.target);
            console.log("upload error code:");
            console.error(error);
        });

})
}


document.addEventListener("deviceready", onDeviceReady, false);
if(debug) onDeviceReady();