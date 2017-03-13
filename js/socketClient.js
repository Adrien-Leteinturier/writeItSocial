(function(window, io){

    $(document).ready(function(){


    var socket = io.connect();

/*------------------Count reel Time---------------------*/
        socket.on('usersCountLog', function (data) {
            $('.num,.valueLogin').html(data);
        });

        socket.on('usersLiveCount', function (data) {
            $('.valueConnect').html(data);
        });        

        socket.on('postItsCountLog', function (data) {
            $('.valuePost').html(data);
        });
        socket.on('chatCount', function (data) {
            $('.valueConnect').html(data);
        });

        
/*------------------Count reel Time ends---------------------*/


/*------------------List friends---------------------*/

    socket.on('liveFriendList',function(data){
        console.log(data);
    });

/*------------------List friends ends---------------------*/


/*------------------List all Post---------------------*/
   socket.on('allPostDisplay',function(data){
        $('#parentDiv').empty();
        for(var i = 0; i<data.length; i++){
            if(!data[i].srcfile){
                let html = ('<div class="parent-div-post-content"><div class="post-content"><div class="post-container"><img src='+'"'+ data[i].srcPhotoUser +'"'+'alt="user" class="profile-photo-md pull-left" id="post-author-image"><div class="post-detail"><div class="user-info"><h5><a href="timeline.html" class="profile-link" id="name-user-post">'+ data[i].auteur +'</a><p id="date-post">'+ data[i].date +'</p></div><div class="reaction"></div><div class="line-divider"></div><div id="post-text"><p>'+ data[i].texte +'</p></div</div></div></div></div>')
                $('#parentDiv').append(html);
            } else {
                let html = ('<div class="parent-div-post-content"><div class="post-content"><img src='+ '"'+ data[i].srcfile + '"' +'alt="post-image" id="post-image"><div class="post-container"><img src='+'"'+ data[i].srcPhotoUser +'"'+'alt="user" class="profile-photo-md pull-left" id="post-author-image"><div class="post-detail"><div class="user-info"><h5><a href="timeline.html" class="profile-link" id="name-user-post">'+ data[i].auteur +'</a><p id="date-post">'+ data[i].date +'</p></div><div class="reaction"></div><div class="line-divider"></div><div id="post-text"><p>'+ data[i].texte +'</p></div></div></div></div></div>')
                $('#parentDiv').append(html);                
            }
        }
    });
    
/*------------------List all Post ends---------------------*/


/*------------------Display messages profil Friends---------------------*/
   socket.on('displayMess',function(data){
        $('#parentDivMessage').empty();
        for(var i = 0; i<data.length; i++){
            console.log(data[i].pseudo)
                let htmlMessages = ('<div class="post-message-profil-friends"><div class="row no-margin contentPostDisplayFriends"><div class="col-md-4 col-sm-4 col-xs-4 text-center"><img class="img-profile-messages imgPostDisplayFriends" src="../'+ data[i].srcfile +'" /><p>'+ data[i].pseudo +'</p></div><div class="texteMessages col-md-8 col-sm-8 col-xs-8 texteMessages"><p class="mess">'+ data[i].texte +'</p><p class="mess">'+ data[i].date +'</p></div></div></div>')
                $('#parentDivMessage').append(htmlMessages);
        }
    });        


/*------------------Display messages profil---------------------*/
   socket.on('displayMessPublic',function(data){
       console.log('ici audrey' + data)
       
        $('#parentDivMessageProfil').empty();
        for(var i = 0; i<data.length; i++){
            console.log(data[i].pseudo)
                let htmlMessages = ('<div class="post-message-profil-friends"><div class="row no-margin contentPostDisplayFriends"><div class="col-md-4 col-sm-4 col-xs-4 text-center"><img class="img-profile-messages imgPostDisplayFriends" src="../'+ data[i].srcfile +'" /><p>'+ data[i].pseudo +'</p></div><div class="texteMessages col-md-8 col-sm-8 col-xs-8 texteMessages"><a class="deleteMess fi-trash" data-id='+ data[i]._id +'></a><p class="mess">'+ data[i].texte +'</p><p class="mess">'+ data[i].date +'</p></div></div></div>')
                $('#parentDivMessageProfil').append(htmlMessages);
        }
    }); 


/*------------------Display Chat Session list Participant ---------------------*/
   socket.on('displaySession',function(data){
       console.log(data);
        $('#displaySessionListPart').empty();
        for(var i = 0; i<data.length; i++){
            let htmlChatList = ('<div class="nav listPartLive"><img class="profile-photo-sm pull-left" src="../'+ data[i].srcfile +'" alt="' + data[i].pseudo + '" /><h3>'+ data[i].pseudo +'</h3></div>')                    
            $('#displaySessionListPart').append(htmlChatList);
        }
    });       

/*------------------Display Messages Chat Session  ---------------------*/
   socket.on('displayMessageSession',function(data){
       console.log(data);
        $('#displaySessionListMess').empty();
        for(var i = 0; i<data.length; i++){
            let htmlMessList = ('<ul class="chat-message"><li class="left"><img class="profile-photo-sm pull-left" src="../'+ data[i].srcfile +'"/></li><div class="chat-item"><div class="chat-item-header"><h5>'+ data[i].pseudo +'</h5><p>'+ data[i].texte +'</p></div></div></ul>')                    
            $('#displaySessionListMess').append(htmlMessList);
        }
    });        




/*------------------Search bar-------------------------*/
    $('.form-search-bar').submit(function(event){
        event.preventDefault();
    });

    $('.search-bar').on('change',function(){
        var valSearch = $('.search-bar').val()
        socket.emit('searchBar',valSearch);
    });
    socket.on('returnSearch',function(data){
        console.log(data.users[0]);
        $('#resultSearch').empty();
        for(var i = 0; i<data.users.length;i++){
            let htmlSearch = ('<div class="col-md-2 result-post"><a href="/profilPublic/'+ data.users[i]._id +'" alt="'+ data.users[i].pseudo +'" title="'+ data.users[i].pseudo +'"><img class="profile-photo-md" src="../'+ data.users[i].srcfile +'" alt="profile photo md"></a><a href="#" alt="'+ data.users[i].pseudo +'"><p>'+ data.users[i].pseudo +'</p></a></div>')
            $('#resultSearch').append(htmlSearch);
        }
        if($('.search-bar').val() === ''){
            $('#resultSearch').empty();
        }
    });
/*------------------Search bar end---------------------*/


/*-----------------Ajax Create Post-------------------------*/
 
    $('#form-create-post').submit(function(event) {
        event.preventDefault();
        var data = new FormData(this);
        $.ajax({
            method: 'POST',
            url: '/dash',
            contentType: false,
            processData: false,
            data: data
        }).done(function(result) {
        })
        $('#create-post-textarea').val('');
        $('#file').val('');
    });

/*-----------------Ajax Create message profil-------------------------*/

    $('#form-message-post').submit(function(event) {
        event.preventDefault();
        var data = {
            'messagePost': $('#create-message-textarea').val()
        };
        var url = $("#form-message-post").attr('action');
        $.ajax({
            method: 'POST',
            url: url,
            data: data
        }).done(function(result) {
            alert('Message envoyé avec succés');
        })
        $('#create-message-textarea').val('')
    });


/*-----------------Ajax delete message-------------------------*/

    $(document).on('click','.deleteMess', function() {
        console.log('click');
        var url = '/deleteMessages/' + $(this).attr('data-id');
        console.log(url);
        $.ajax({
            method: 'GET',
            url: url
        }).done(function(result) {
            console.log('Message supprimer');
        })
    });

/*-----------------Ajax create chat -------------------------*/
    $('#crossInvite').on('click',function(){
        console.log('click cross');
        $.ajax({
            method:'POST',
            url: '/chat'
        }).done(function(result){
            console.log('Session chat creer !')
            location.reload(true);
        })
    })

/*-----------------Ajax message chat -------------------------*/
    $('#form-create-message-chat').submit(function(event) {
        event.preventDefault();
        var url = $('#form-create-message-chat').attr('action');
        var data = {
            'messageChat': $('.input-message-chat').val()
        };    
        $.ajax({
            method: 'POST',
            url: url,
            data: data
        }).done(function(result) {
        })
        $('.input-message-chat').val('')
    });

/*-----------------Ajax invitation chat -------------------------*/
    $('#inviteFriendsChat').click(function(event) {
    event.preventDefault();
    alert('Invitation envoyé avec succes')
    var url = $('#inviteFriendsChat').attr('href');
    var data = {
        'urlChat': $('#inviteFriendsChat').attr('data-id')
    };    
    $.ajax({
        method: 'POST',
        url: url,
        data: data
    }).done(function(result) {
    })
});



    })
})(window, io);


