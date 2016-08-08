//CHAT START
var MESSAGE_TEXT_HEIGHT = 27;
function initChat(){

    $('.body-content').css({
        width: "100 % !important",
        margin:"0px"
    });

    var user_id=makeid();
    var user_name="";
    if(window.localStorage.getItem('user_name')){
        user_name=window.localStorage.getItem('user_name');
    }
    window.cApp={
        menuPosition:1,
        currentChannel:null,
        guest_id:user_id,
        user_name:user_name,
        blockConfig:{
            message: ' ',
            css: {
                width:'48px',
                height:'48px',
                border: 'none',
                padding: '15px',
                '-webkit-border-radius': '10px',
                '-moz-border-radius': '10px',
                opacity: .5,
                color: '#fff',
                left:'50%',
                background:"url('..img/load_48x48.gif')"
            }
        },
        channelPage:1,
        channelLimit:20,
        blockLoadMessage:false
    };
    $("#nickNameInput").val(window.cApp.user_name);

//------------CHANNELS START





    $.when( initSendBird()).then(
        function(status ){
            $.when( getChannelList(window.cApp.channelPage,window.cApp.channelLimit,true)).then(
                function(data){
                    loadedThreads();
                }
            );
        },
        function(status ){
            alert('Connection ERROR');
        }
    );


    /*-----------------SCROLL GET MORE THREADS*/
    var myScrollThreads,
        pullDownElThreads, pullDownOffsetThreads,
        pullUpElThreads, pullUpOffsetThreads,
        generatedCountThreads = 0;

    function pullDownAction () {


            $.when( getChannelList(window.cApp.channelPage,window.cApp.channelLimit,false)).then(

                function(data){
                    myScrollThreads.refresh();
                }
            );



            		// Remember to refresh when contents are loaded (ie: on ajax completion)

    }

    function pullUpAction () {
        /*$.when( getChannelList(window.cApp.channelPage,window.cApp.channelLimit)).then(
            function(data){
                myScrollThreads.refresh();
            }
        );*/

    }

    function loadedThreads() {
        pullDownElThreads = document.getElementById('pullDownThreads');
        pullDownOffsetThreads = pullDownElThreads.offsetHeight;
        pullUpElThreads = document.getElementById('pullUpThreads');
        pullUpOffsetThreads = pullUpElThreads.offsetHeight;

        myScrollThreads = new iScroll('chatThreads', {
            useTransition: true,
            topOffset: pullDownOffsetThreads,
            onRefresh: function () {
                if (pullDownElThreads.className.match('loading')) {
                    pullDownElThreads.className = '';
                    pullDownElThreads.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
                } else if (pullUpElThreads.className.match('loading')) {
                    pullUpElThreads.className = '';
                    pullUpElThreads.querySelector('.pullUpLabel').innerHTML = 'Pull up to load more...';
                }
            },
            onScrollMove: function () {
                if (this.y > 5 && !pullDownElThreads.className.match('flip')) {
                    pullDownElThreads.className = 'flip';
                    pullDownElThreads.querySelector('.pullDownLabel').innerHTML = 'Release to refresh...';
                    this.minScrollY = 0;
                } else if (this.y < 5 && pullDownElThreads.className.match('flip')) {
                    pullDownElThreads.className = '';
                    pullDownElThreads.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
                    this.minScrollY = -pullDownOffsetThreads;
                } else if (this.y < (this.maxScrollY - 5) && !pullUpElThreads.className.match('flip')) {
                    pullUpElThreads.className = 'flip';
                    pullUpElThreads.querySelector('.pullUpLabel').innerHTML = 'Release to refresh...';
                    this.maxScrollY = this.maxScrollY;
                } else if (this.y > (this.maxScrollY + 5) && pullUpElThreads.className.match('flip')) {
                    pullUpElThreads.className = '';
                    pullUpElThreads.querySelector('.pullUpLabel').innerHTML = 'Pull up to load more...';
                    this.maxScrollY = pullUpOffsetThreads;
                }
            },
            onScrollEnd: function () {
                if (pullDownElThreads.className.match('flip')) {
                    pullDownElThreads.className = 'loading';
                    pullDownElThreads.querySelector('.pullDownLabel').innerHTML = 'Loading...';
                    pullDownAction();	// Execute custom function (ajax call?)
                } else if (pullUpElThreads.className.match('flip')) {
                    pullUpElThreads.className = 'loading';
                    pullUpElThreads.querySelector('.pullUpLabel').innerHTML = 'Loading...';
                    pullUpAction();	// Execute custom function (ajax call?)
                }
            }
        });

        setTimeout(function () { document.getElementById('chatThreads').style.left = '0'; }, 800);
    }

    $("#tab-3").on('click',function(){

        myScrollThreads.refresh();
    });
    //document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);




    /*--------------------SCROLL GET MORE THREADS END*/




    $('#threadMenuButton').on('click',function(){
        $("#chatMenu_1").modal('show');
        /*$('body').css('overflow','hidden');
         $('body').css('position','fixed');*/
    });

    $('#chatMenuButton').on('click',function(){
        $("#chatMenu_3").modal('show');
    });
    $('#goThreads').on('click',function(){
        $("#chatMenu_3").modal('hide');
        $("#chat_container").hide();
        $("#thread_container").show();
    });
    //CREATE CHANNEL
    $('#createThread').on('click',function(){
        $("#chatMenu_1").modal('hide');
        $("#chatMenu_2").modal('show');
    });
    $('#createChannel').on('click',function(){
        $("#chatMenu_2").modal('hide');
        $(window).block(window.cApp.blockConfig);
        var title='channel_' + (Math.round(Math.random() * 10000));
        if($("#threadTitleInput").val()!=""){
            title=$("#threadTitleInput").val();
        }
        $("#threadTitleInput").val("");
        $.get("http://crm1.webpro5.ru/apget.php",{title:title},function(){


            $.when( getChannelList(window.cApp.channelPage,window.cApp.channelLimit)).then(
                function(data){
                    joinChannel(title);
                    $(window).unblock();
                },
                function(error){
                    $(window).unblock();
                    alert(error);
                }
            );
        });
    });

    //CREATE CHANNEL WITH IMG

    $("#createThreadWithImg").click(function(){
        $("#createThreadWithImg_modal").modal('show');
    });
    $("#proceedThreadImg").click(function(){
        if($.trim($("#threadImgInput").val())!="") {



            $("#createThreadWithImg_modal").modal('hide');
            var title = $("#threadImgInput").val();
            $("#threadImgInput").val("");

            $.get("http://crm1.webpro5.ru/apget.php", {title: title}, function () {
                $('#tab-3').trigger('click');
                $(window).block(cApp.blockConfig);
                $.when(joinChannel(title)).then(
                    function(status){

                        var img=$(".image-container").find('img')[0];



                        function getBase64Image(img) {
                            // Create an empty canvas element
                            var canvas = document.createElement("canvas");
                            canvas.width = img.width;
                            canvas.height = img.height;

                            // Copy the image contents to the canvas
                            var ctx = canvas.getContext("2d");
                            ctx.drawImage(img, 0, 0);

                            // Get the data-URL formatted image
                            // Firefox supports PNG and JPEG. You could check img.src to guess the
                            // original format, but be aware the using "image/jpg" will re-encode the image.
                            var dataURL = canvas.toDataURL("image/png");
                            return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");

                        }
                        var image=getBase64Image(img);
                        uploadImage(image);

                    }
                );
            });
        }


    });

    function getChannelList(page, limit,init){
        var dfd = jQuery.Deferred();
        sendbird.getChannelList({
            "page": page,
            "limit": limit,
            "successFunc" : function(data) {
                var i = 0, l = data.channels.length;


                if(data.channels.length==0){
                    dfd.resolve( data);
                }else{
                    /*if(data.channels.length!=window.cApp.channelLimit){
                        window.cApp.channelLimit=data.channels.length;
                    }*/
                    window.cApp.channelPage++;
                }
                if(init){
                    _.each(data.channels,function(channel){
                        var tpl='<div data-id="'+channel.id+'" data-channel_url="'+channel.channel_url+'" class="jumbotron chatChannel"> <h4>'+channel.name+'</h4></div>';
                        tpl=$(tpl);
                        $(tpl).prependTo("#thelistThreads");
                    });

                    dfd.resolve(data);
                }

                (function iterator() {

                    var channel=data.channels[i];


                    if(++i<l) {
                        setTimeout(iterator, 200);
                    }else{
                        dfd.resolve( data);
                    }
                })();



            },
            "errorFunc": function(status, error) {
                dfd.reject( error);
            }
        });
        return dfd.promise();
    }
    //JOIN CHANNEL
    $( "#chatThreads" ).delegate( ".chatChannel", "click", function(e) {
        joinChannel($(e.currentTarget).data('channel_url'));
    });






/*---------------CHANELS END*/
    $('#changeNickName').on('click',function(){
        $("#chatMenu_1").modal('hide');
        $(window).block(window.cApp.blockConfig);
        window.cApp.user_name=$("#nickNameInput").val();
        window.localStorage.setItem('user_name',window.cApp.user_name);
        $.when(initSendBird()).then(
            function(status){
                $(window).unblock();
                console.log('here');
            },
            function(status ){
                $(window).unblock();
                alert('Connection ERROR');
            }
        );
    });

    //SEND MESSAGE
    function hideKeyboard() {
        //this set timeout needed for case when hideKeyborad
        //is called inside of 'onfocus' event handler
        setTimeout(function() {

            //creating temp field
            var field = document.createElement('input');
            field.setAttribute('type', 'text');
            //hiding temp field from peoples eyes
            //-webkit-user-modify is nessesary for Android 4.x
            field.setAttribute('style', 'position:absolute; top: 0px; opacity: 0; -webkit-user-modify: read-write-plaintext-only; left:0px;');
            document.body.appendChild(field);

            //adding onfocus event handler for out temp field
            field.onfocus = function(){
                //this timeout of 200ms is nessasary for Android 2.3.x
                setTimeout(function() {

                    field.setAttribute('style', 'display:none;');
                    setTimeout(function() {
                        document.body.removeChild(field);
                        document.body.focus();
                    }, 14);

                }, 200);
            };
            //focusing it
            field.focus();

        }, 50);
    }

    $("#messageChatInput").on('click',function(){
        /*document.addEventListener('backbutton', function () {

            sendMessage();
        }, false);*/
    });
    $("#sendMessage").on('click',function(){
        var message=$("#messageChatInput").val();

        if($.trim(message)==""){

            return false;
        }
        $("#messageChatInput").val("");

        sendbird.message($.trim(message));

        scrollPositionBottom();

        Keyboard.hide();
    });
    /*window.addEventListener('native.keyboardshow', function (e) {
        var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        //alert(viewportHeight);

        var scrollLimit = viewportHeight - (document.activeElement.offsetHeight + document.activeElement.offsetTop);
        //alert(scrollLimit);
        /!*$(".portlet-footer").css('bottom','initial');
        $(".portlet-footer").css('top',scrollLimit+"px")*!/
        /!*var keyboardHeight = e.keyboardHeight;
        $(".portlet-footer").css('bottom',keyboardHeight+"px");*!/
    });
    window.addEventListener('native.keyboardhide', function (e) {
        $(".portlet-footer").css('bottom',"0px");
    });*/

    var sendMessage=function(){
        /*document.removeEventListener('backbutton',function(){});*/

    }


    //SEND PHOTO
    $('#chat_file_input').on('click',function(e){

        e.preventDefault();
        e.stopPropagation();
        if (window.fileChooser && false) {
            alert('filechooser');
            fileChooser.open(uploadImage);
        } else {

            //$file.click();
            navigator.camera.getPicture(
                uploadImage,
                function(){},
                {
                    quality:50,
                    destinationType: navigator.camera.DestinationType.DATA_URL ,
                    sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM
                }
            )
        }
    });















}
function uploadImage(imageURI) {

    var byteCharacters = atob(imageURI);
    var byteNumbers = new Array(byteCharacters.length);
    for (var i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    var byteArray = new Uint8Array(byteNumbers);
    var image = new Blob([byteArray], {type: 'image/jpeg'});


    $('.chat-input-file').addClass('file-upload');

    sendbird.sendFile(
        image,
        {
            "successFunc" : function(data) {
                $('.chat-input-file').removeClass('file-upload');
                $('#chat_file_input').val('');

                $(window).unblock()
            },
            "errorFunc": function(status, error) {
                $('.chat-input-file').removeClass('file-upload');
                $('#chat_file_input').val('');
                console.error(status, error);
                alert(error);
                $(window).unblock()
            }
        }
    );
}


function joinChannel(channelUrl){
    var dfd = jQuery.Deferred();
    $(window).block(window.cApp.blockConfig);
    sendbird.joinChannel(
        channelUrl,
        {
            "successFunc": function(data) {
                $(window).unblock();
                $("#chat_container").show();
                $("#thread_container").hide();
                currChannelInfo = data;
                currChannelUrl = currChannelInfo['channel_url'];
                $(".chat-label").html(currChannelInfo['name'])

                $('.chat-canvas').html('');


                sendbird.connect({
                    "successFunc": function(data) {
                        isOpenChat = true;
                        $.when(loadMoreChatMessage(scrollPositionBottom)).then(function(){
                            dfd.resolve();
                        });



                        $('.chat-input-text__field').attr('disabled', false);

                    },
                    "errorFunc": function(status, error) {
                        console.log(status, error);
                    }
                });
            },
            "errorFunc": function(status, error) {
                console.log(status, error);
            }
        }
    );
    return dfd.promise();
}
function loadMoreChatMessage(func) {
    var dfd = jQuery.Deferred();
    if(window.cApp.blockLoadMessage){
        return false;
    }
    window.cApp.blockLoadMessage=true;
    sendbird.getMessageLoadMore({
        "limit": 20,
        "successFunc": function(data) {
            window.cApp.blockLoadMessage=false;
            var moreMessage = data["messages"];



            var messages=moreMessage.reverse();
            var msgList = '';
            var msgListHeight=0;

            _.each(messages,function(msg){
                if (sendbird.isMessage(msg.cmd)) {

                    msgList+= messageList(msg.payload);
                    msgListHeight+=20;
                } else if (sendbird.isFileMessage(msg.cmd)) {
                    if (!sendbird.hasImage(msg.payload)) {
                        msgList+= fileMessageList(msg.payload);
                        msgListHeight+=70;
                    } else {
                        msgListHeight+=70;
                        msgList+= imageMessageList(msg.payload);
                    }
                }
            });

            console.log(msgListHeight);
            $(msgList).hide().prependTo(".chat-canvas").fadeIn(1000);
            $(".chat-canvas__list-file-img").lazyload();
            $('.chat-canvas')[0].scrollTop = (msgListHeight);

            
            if (func != undefined) func();
            dfd.resolve(data);
        },
        "errorFunc": function(status, error) {
            window.cApp.blockLoadMessage=false;
            console.log(status, error);
            dfd.reject(error);
        }
    });
    return dfd.promise();
}
function messageList(obj) {
    var msgList = '';
    if (isCurrentUser(obj['user']['guest_id'])) {
        msgList += '' +
            '<div class="chat-canvas__list">' +
            '  <label class="chat-canvas__list-name chat-canvas__list-name__user">' +
            nameInjectionCheck(obj['user']['name']) +
            '  </label>' +
            '  <label class="chat-canvas__list-separator">:</label>' +
            '  <label class="chat-canvas__list-text">' +
            convertLinkMessage(obj['message']) +
            '  </label>' +
            '</div>';
    } else {
        msgList += '' +
            '<div class="chat-canvas__list">' +
            '  <label class="chat-canvas__list-name">' +
            nameInjectionCheck(obj['user']['name']) +
            '  </label>' +
            '  <label class="chat-canvas__list-separator">:</label>' +
            '  <label class="chat-canvas__list-text">' +
            convertLinkMessage(obj['message']) +
            '  </label>' +
            '</div>';
        if (!document.hasFocus()) {
            notifyMessage(obj['message']);
        }
        return msgList;
    }
}

function fileMessageList(obj) {
    var msgList = '';
    if (isCurrentUser(obj['user']['guest_id'])) {
        msgList += '' +
            '<div class="chat-canvas__list">' +
            '  <label class="chat-canvas__list-name chat-canvas__list-name__user">' +
            obj['user']['name'] +
            '  </label>' +
            '  <label class="chat-canvas__list-separator">:</label>' +
            '  <label class="chat-canvas__list-text">' +
            '    <label class="chat-canvas__list-text-file">FILE</label>' +
            '    <a href="' + obj['url'] + '" target="_blank">' + obj['name'] + '</a>' +
            '  </label>' +
            '</div>';
    } else {
        msgList += '' +
            '<div class="chat-canvas__list">' +
            '  <label class="chat-canvas__list-name">' +
            obj['user']['name'] +
            '  </label>' +
            '  <label class="chat-canvas__list-separator">:</label>' +
            '  <label class="chat-canvas__list-text">' +
            '    <label class="chat-canvas__list-text-file">FILE</label>' +
            '    <a href="' + obj['url'] + '" target="_blank">' + obj['name'] + '</a>' +
            '  </label>' +
            '</div>';

    }
    return msgList;
}

function imageMessageList(obj) {
    var msgList = '';
    if (isCurrentUser(obj['user']['guest_id'])) {
        msgList += '' +
            '<div class="chat-canvas__list">' +
            '  <label class="chat-canvas__list-name chat-canvas__list-name__user">' +
            obj['user']['name'] +
            '  </label>' +
            '  <label class="chat-canvas__list-separator">:</label>' +
            '  <label class="chat-canvas__list-text">' +
            obj['name'] +
            '  </label>' +
            '  <div class="chat-canvas__list-file" onclick="window.open(\'' + obj['url'] + '\', \'_blank\');">' +
            '    <img style="max-width:170px;" src="' + obj['url'] + '" class="chat-canvas__list-file-img" onload="afterImageLoad(this)">' +
            '  </div>' +
            '</div>';
    } else {
        msgList += '' +
            '<div class="chat-canvas__list">' +
            '  <label class="chat-canvas__list-name">' +
            obj['user']['name'] +
            '  </label>' +
            '  <label class="chat-canvas__list-separator">:</label>' +
            '  <label class="chat-canvas__list-text">' +
            obj['name'] +
            '  </label>' +
            '  <div class="chat-canvas__list-file" onclick="window.open(\'' + obj['url'] + '\', \'_blank\');">' +
            '    <img style="max-width:170px;" src="' + obj['url'] + '" class="chat-canvas__list-file-img" onload="afterImageLoad(this)">' +
            '  </div>' +
            '</div>';

    }
    return msgList;
}




function initSendBird(){
    var dfd = jQuery.Deferred();
    sendbird.init({
        "app_id": '3DEAE7C0-A835-469B-934F-D6CF4ABE8B4F',
        "guest_id": checkGuestId(),
        "user_name": window.cApp.user_name,
        "image_url": '',
        "access_token":"",
        "successFunc": function(data) {
            sendbird.connect();

            dfd.resolve( "hurray" );

        },
        "errorFunc": function(status, error) {
            dfd.reject( "sorry" );
        }
    });
    sendbird.events.onMessageReceived = function(obj) {
        setChatMessage(obj);
    };

    sendbird.events.onSystemMessageReceived = function(obj) {
        setSysMessage(obj);
    };

    sendbird.events.onFileMessageReceived = function(obj) {
        if (sendbird.hasImage(obj)) {
            setImageMessage(obj);
        } else {
            setFileMessage(obj);
        }
    };

    sendbird.events.onBroadcastMessageReceived = function(obj) {
        setBroadcastMessage(obj);
    };

    sendbird.events.onMessagingChannelUpdateReceived = function(obj) {
        unreadCountUpdate(obj);
    };

    sendbird.events.onTypeStartReceived = function(obj) {
        var userId = obj['user']['guest_id'];
        $.each(memberList, function(index, member) {
            if (member['guest_id'] == userId) {
                isTyping = true;

                $.each(typingUser, function(index, user) {
                    if (user['user']['guest_id'] == userId) {
                        isTyping = false;
                    }
                });

                if (isTyping) {
                    typingUser.push(obj);
                }
            }
        });

        if (isTyping) {
            var typingMember = '';
            $.each(typingUser, function(index, user) {
                typingMember += user['user']['name'] + ', ';
            });

            if (typingMember.length > 2) {
                if (typingUser.length > 2) {
                    typingMember = 'someone are';
                } else if (typingUser.length == 2) {
                    typingMember = '{} are'.format(typingMember.slice(0, -2));
                } else {
                    typingMember = '{} is'.format(typingMember.slice(0, -2));
                }
            }

            $('.chat-input-typing').html('{} typing...'.format(typingMember));
            $('.chat-input-typing').show();
        }

    };

    sendbird.events.onTypeEndReceived = function(obj) {
        endTyping(obj['user']['guest_id']);
    };

    sendbird.events.onReadReceived = function(obj) {
        console.log(obj);
    };

    sendbird.events.onMessageDelivery = function(obj) {
        console.log(obj);
    };

    sendbird.setDebugMessage(false);
    return dfd.promise();
}
function addMessagingChannel(isGroup, channelMemberList, targetChannel) {
    $.each($('.left-nav-channel'), function(index, channel) {
        $(channel).removeClass('left-nav-channel-open--active');
        $(channel).removeClass('left-nav-channel-messaging--active');
        $(channel).removeClass('left-nav-channel-group--active');
    });

    var addFlag = true;
    $.each($('.left-nav-channel-messaging'), function(index, channel) {
        if (currChannelUrl == $(channel).data('channel-url')) {
            $(channel).addClass('left-nav-channel-messaging--active');
            $(channel).find('div[class="left-nav-channel-leave"]').attr('style', '');
            $(channel).find('div[class="left-nav-channe__unread"]').remove();
            sendbird.markAsRead(currChannelUrl);
            addFlag = false;
        }
    });
    $.each($('.left-nav-channel-group'), function(index, channel) {
        if (currChannelUrl == $(channel).data('channel-url')) {
            $(channel).addClass('left-nav-channel-group--active');
            $(channel).find('div[class="left-nav-channel-leave"]').attr('style', '');
            $(channel).find('div[class="left-nav-channe__unread"]').remove();
            sendbird.markAsRead(currChannelUrl);
            addFlag = false;
        }
    });

    if (channelMemberList.length > 9) {
        channelMemberList = channelMemberList.substring(0, 9) + '...';
    }

    targetAddMessagingChannel = targetChannel;
    if (addFlag && !isGroup) {
        $('#messaging_channel_list').append(
            '<div class="left-nav-channel left-nav-channel-messaging left-nav-channel-messaging--active" ' +
            '     onclick="joinMessagingChannel(\'' + targetChannel["channel_url"] + '\')"' +
            '     data-channel-url="' + targetChannel["channel_url"] + '"' +
            '>' +
            channelMemberList +
            '  <div class="left-nav-channel-leave" onclick="endMessaging(targetAddMessagingChannel, $(this))"></div>' +
            '</div>'
        );
    } else if (addFlag && isGroup) {
        $('#messaging_channel_list').append(
            '<div class="left-nav-channel left-nav-channel-group left-nav-channel-group--active" ' +
            '     onclick="joinMessagingChannel(\'' + targetChannel["channel_url"] + '\')"' +
            '     data-channel-url="' + targetChannel["channel_url"] + '"' +
            '>' +
            channelMemberList +
            '  <div class="left-nav-channel-leave" onclick="endMessaging(targetAddMessagingChannel, $(this))"></div>' +
            '</div>'
        );
        targetAddMessagingChannel = null;
    }

    $('.modal-guide-create').hide();
    $('.left-nav-button-guide').hide();
}






    function setImageMessage(obj) {
        $('.chat-canvas').append(imageMessageList(obj));
        scrollPositionBottom();
    }

    function setFileMessage(obj) {
        $('.chat-canvas').append(fileMessageList(obj));
        scrollPositionBottom();
    }

    $('.chat-canvas').on('scroll', function() {
        setTimeout(function() {
            var currHeight = $('.chat-canvas').scrollTop();
            if (currHeight == 0) {
                if ($('.chat-canvas')[0].scrollHeight > $('.chat-canvas').height()) {
                    loadMoreChatMessage();
                }
            }
        }, 200);
    });

    function setSysMessage(obj) {
        $('.chat-canvas').append(
            '<div class="chat-canvas__list-notice">' +
            '  <label class="chat-canvas__list-system">' +
            obj['message'] +
            '  </label>' +
            '</div>'
        );
        scrollPositionBottom();
    }

    function setBroadcastMessage(obj) {
        $('.chat-canvas').append(
            '<div class="chat-canvas__list">' +
            '  <label class="chat-canvas__list-broadcast">' +
            obj['message'] +
            '  </label>' +
            '</div>'
        );
        scrollPositionBottom();
    }

var scrollPositionBottom = function() {

    var scrollHeight = $('.chat-canvas')[0].scrollHeight;
    $('.chat-canvas')[0].scrollTop = scrollHeight;
    currScrollHeight = scrollHeight;
};

function afterImageLoad(obj) {
    console.log('here');
    //$('.chat-canvas')[0].scrollTop = $('.chat-canvas')[0].scrollTop + obj.height + $('.chat-canvas__list').height();
}

function setChatMessage(obj) {
    $('.chat-canvas').append(messageList(obj));
    scrollPositionBottom();
}

////END CHAT
