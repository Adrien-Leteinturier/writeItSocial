(function(window, io){

    $(document).ready(function(){


    var socket = io.connect();

/*------------------Count reel Time---------------------*/
        socket.on('usersCountLog', function (message) {
            $('.num,.valueLogin').html(message);
        });

        socket.on('usersLiveCount', function (message) {
            $('.valueConnect').html(message);
        });        

        socket.on('postItsCountLog', function (message) {
            $('.valuePost').html(message);
        });

      /*  socket.on('friendLiveCountLog', function (message) {
            console.log(message);
            $('.compteur-friends').html(message);
        });   

        */             
/*------------------Count reel Time ends---------------------*/

/*------------------List friends---------------------*/

    socket.on('liveFriendList',function(message){
        console.log(message);
    });

/*------------------List friends ends---------------------*/


/*------------------List all Post---------------------*/
   socket.on('allPostDisplay',function(data){
       console.log(data);

        $('head').append('<meta http-equiv="X-UA-Compatible" content="IE=Edge" /><meta property="og:url" content="http://writeIt.ddns.net" /><meta property="og:type" content="WriteItSocial" /><meta property="og:title" content="Adrien Leteinturier - Write It Social" /><meta property="og:description"   content="Your description" /><meta property="og:image" content="logo-footer.png" />');

        //$('#comment').empty();
        $('#parentDiv').empty();
        for(var i = 0; i<data.length; i++){
                let html = ('<div class="parent-div-post-content"><div class="post-content"><img src='+ '"'+ data[i].srcfile + '"' +'alt="post-image" id="post-image"><div class="post-container"><img src='+'"'+ data[i].srcPhotoUser +'"'+'alt="user" class="profile-photo-md pull-left" id="post-author-image"><div class="post-detail"><div class="user-info"><h5><a href="timeline.html" class="profile-link" id="name-user-post">'+ data[i].auteur +'</a><p id="date-post">'+ data[i].date +'</p></div><div class="reaction"></div><div class="line-divider"></div><div id="post-text"><p>'+ data[i].texte +'</p></div><form class="post-comment" method="POST" action="/comments/' + data[i]._id +'"><input type="text" class="form-control" name="textComment" placeholder="Post a comment"></form></div></div></div></div>')
                $('#parentDiv').append(html);

           // if(data[i].comments){
                for(var j = 0; j<data[i].comments.length; j++){
                let comment = ('<div id="comment"><img src='+ data[i].comments[j].srcPhotoUser +' alt="" class="profile-photo-sm"><p class="auteurAndTexteComment"><a href="#" class="profile-link">'+ data[i].comments[j].auteur +'</a>'+' '+ data[i].comments[j].texte + '</p></div>')
                $('.post-detail').append(comment);
                }
          //  }
        }
    });
/*------------------List all Post ends---------------------*/


/*------------------Search bar-------------------------*/
        $('.form-search-bar').submit(function(e){
            e.preventDefault();
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

/*------------------Submit event prevent---------------*/


/*-----------------Ajax Create Post-------------------------*/
 
$('#form-create-post').submit(function(event) {
    event.preventDefault();
  //  var file =  $('#file')[0].files[0];
    var data = {
        'textPost': $('#create-post-textarea').val(),
       // 'image': file
    };
    console.log(data)

    $.ajax({
        type: 'POST',
        url: '/dash',
        data: data
    }).done(function(result) {
    })
    $('#create-post-textarea').val('')
});

/*-----------------Ajax Create message-------------------------*/

/*$('#form-message-post').submit(function(event) {
    event.preventDefault();
  //  var file =  $('#file')[0].files[0];
    var data = {
        'textPost': $('#create-message-textarea').val()
    };
    console.log(data)

    $.ajax({
        type: 'POST',
        url: '/dash',
        data: data
    }).done(function(result) {
    })
    $('#create-message-textarea').val('')
});*/

    })
})(window, io);


