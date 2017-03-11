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

     
/*------------------Count reel Time ends---------------------*/

/*------------------List friends---------------------*/

    socket.on('liveFriendList',function(data){
        console.log(data);
    });

/*------------------List friends ends---------------------*/


/*------------------List all Post---------------------*/
   socket.on('allPostDisplay',function(data){
       $('head').append('<meta http-equiv="X-UA-Compatible" content="IE=Edge" /><meta property="og:url" content="http://writeIt.ddns.net" /><meta property="og:type" content="WriteItSocial" /><meta property="og:title" content="Adrien Leteinturier - Write It Social" /><meta property="og:description"   content="Your description" /><meta property="og:image" content="logo-footer.png" />');
        //$('#comment').empty();
        $('#parentDiv').empty();
        for(var i = 0; i<data.length; i++){
            if(!data[i].srcfile){
                let html = ('<div class="parent-div-post-content"><div class="post-content"><div class="post-container"><img src='+'"'+ data[i].srcPhotoUser +'"'+'alt="user" class="profile-photo-md pull-left" id="post-author-image"><div class="post-detail"><div class="user-info"><h5><a href="timeline.html" class="profile-link" id="name-user-post">'+ data[i].auteur +'</a><p id="date-post">'+ data[i].date +'</p></div><div class="reaction"></div><div class="line-divider"></div><div id="post-text"><p>'+ data[i].texte +'</p></div><form class="post-comment" method="POST" action="/comments/' + data[i]._id +'"><input type="text" class="form-control" name="textComment" placeholder="Post a comment"></form></div></div></div></div>')
                $('#parentDiv').append(html);
            } else {
                let html = ('<div class="parent-div-post-content"><div class="post-content"><img src='+ '"'+ data[i].srcfile + '"' +'alt="post-image" id="post-image"><div class="post-container"><img src='+'"'+ data[i].srcPhotoUser +'"'+'alt="user" class="profile-photo-md pull-left" id="post-author-image"><div class="post-detail"><div class="user-info"><h5><a href="timeline.html" class="profile-link" id="name-user-post">'+ data[i].auteur +'</a><p id="date-post">'+ data[i].date +'</p></div><div class="reaction"></div><div class="line-divider"></div><div id="post-text"><p>'+ data[i].texte +'</p></div><form class="post-comment" method="POST" action="/comments/' + data[i]._id +'"><input type="text" class="form-control" name="textComment" placeholder="Post a comment"></form></div></div></div></div>')
                $('#parentDiv').append(html);                
            }

           // if(data[i].comments){
                for(var j = 0; j<data[i].comments.length; j++){
                let comment = ('<div id="comment"><img src='+ data[i].comments[j].srcPhotoUser +' alt="" class="profile-photo-sm"><p class="auteurAndTexteComment"><a href="#" class="profile-link">'+ data[i].comments[j].auteur +'</a>'+' '+ data[i].comments[j].texte + '</p></div>')
                $('.post-detail').append(comment);
                }
          //  }
        }
    });
    
/*------------------List all Post ends---------------------*/


/*------------------Display messages profil Friends---------------------*/
   socket.on('displayMess',function(data){
       console.log('ici audrey' + data)
       $('head').append('<meta http-equiv="X-UA-Compatible" content="IE=Edge" /><meta property="og:url" content="http://writeIt.ddns.net" /><meta property="og:type" content="WriteItSocial" /><meta property="og:title" content="Adrien Leteinturier - Write It Social" /><meta property="og:description"   content="Your description" /><meta property="og:image" content="logo-footer.png" />');
       
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
       $('head').append('<meta http-equiv="X-UA-Compatible" content="IE=Edge" /><meta property="og:url" content="http://writeIt.ddns.net" /><meta property="og:type" content="WriteItSocial" /><meta property="og:title" content="Adrien Leteinturier - Write It Social" /><meta property="og:description"   content="Your description" /><meta property="og:image" content="logo-footer.png" />');
       
        $('#parentDivMessageProfil').empty();
        for(var i = 0; i<data.length; i++){
            console.log(data[i].pseudo)
                let htmlMessages = ('<div class="post-message-profil-friends"><div class="row no-margin contentPostDisplayFriends"><div class="col-md-4 col-sm-4 col-xs-4 text-center"><img class="img-profile-messages imgPostDisplayFriends" src="../'+ data[i].srcfile +'" /><p>'+ data[i].pseudo +'</p></div><div class="texteMessages col-md-8 col-sm-8 col-xs-8 texteMessages"><a class="deleteMess fi-trash" data-id='+ data[i]._id +'></a><p class="mess">'+ data[i].texte +'</p><p class="mess">'+ data[i].date +'</p></div></div></div>')
                $('#parentDivMessageProfil').append(htmlMessages);
        }
    }); 

/*------------------Display Chat ---------------------*/
   socket.on('displayChat',function(data){
       console.log(data);
       $('head').append('<meta http-equiv="X-UA-Compatible" content="IE=Edge" /><meta property="og:url" content="http://writeIt.ddns.net" /><meta property="og:type" content="WriteItSocial" /><meta property="og:title" content="Adrien Leteinturier - Write It Social" /><meta property="og:description"   content="Your description" /><meta property="og:image" content="logo-footer.png" />');
        $('#divChatParent').empty();
        for(var i = 0; i<data.length; i++){
                if(data[i].participants < 1) {
                    let htmlChats = ('<div class="row no-margin contentChatsDisplay text-center"><div class="col-md-offset-2 col-sm-offset-2 col-xs-offset-2 col-md-8 col-sm-8 col-xs-8"><img class="img-profile-messages imgPostDisplayFriends" src="../'+ data[i].srcfile +'" /><p>'+ data[i].hote +'<p/><p>Participants<p/><div class="row"><div class="col-md-2"></div></div><i class="fi-arrow-up" data.id='+ data[i]._id +'></i><i class="fi-trash"></i></div></div>')                    
                    $('#divChatParent').append(htmlChats);
                } else {
                for(var j = 0; j<data[i].participants.length;j++){
                    let htmlChats = ('<div class="row no-margin contentChatsDisplay text-center"><div class="col-md-offset-2 col-sm-offset-2 col-xs-offset-2 col-md-8 col-sm-8 col-xs-8"><img class="img-profile-messages imgPostDisplayFriends" src="../'+ data[i].srcfile +'" /><p>'+ data[i].hote +'<p/><p>Participants<p/><div class="row"><div class="col-md-2"><img class="img-profile-messages imgPostDisplayFriends" src="../'+ data[i].participants[j].srcfile +'"/></div></div><i class="fi-arrow-up" data.id='+ data[i]._id +'></i><i class="fi-trash"></i></div></div>')                    
                    $('#divChatParent').append(htmlChats);
                }
            }
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
                let htmlSearch = ('<div class="col-md-1 result-post"><a href="/profilPublic/'+ data.users[i]._id +'" alt="'+ data.users[i].pseudo +'" title="'+ data.users[i].pseudo +'"><img class="profile-photo-md" src="'+ data.users[i].srcfile +'" alt="profile photo md"></a><a href="#" alt="'+ data.users[i].pseudo +'"><p>'+ data.users[i].pseudo +'</p></a></div>')
            $('#resultSearch').append(htmlSearch);
            }
            if($('.search-bar').val() === ''){
                $('#resultSearch').empty();
            }
        });
/*------------------Search bar end---------------------*/



/*------------------Ajax signUp prevent---------------*/
$('#floginForm').submit(function(event) {
    event.preventDefault();
  var data = new FormData(this);
    console.log(data)

    $.ajax({
        method: 'POST',
        url: '/inscription',
        contentType: false,
        processData: false,
        data: data
    }).done(function(result) {
        $('.button-inscription').notify(
        'Félcicitations votre inscription est validée !', 
        { position:'bottom' }
        );        
    })
});


/*-----------------Ajax Create Post-------------------------*/
 
$('#form-create-post').submit(function(event) {
    event.preventDefault();
  var data = new FormData(this);
    console.log(data)

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
  //  var file =  $('#file')[0].files[0];
    var data = {
        'messagePost': $('#create-message-textarea').val()
    };
    var url = $("#form-message-post").attr('action');
    console.log(url);


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
$('.crossInvite').on('click',function(){
    console.log('click cross');
    $.ajax({
        method:'POST',
        url: '/chat'
    }).done(function(result){
        console.log('Session chat creer !')
    })
})






    })
})(window, io);


