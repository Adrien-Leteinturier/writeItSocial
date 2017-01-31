$(document).ready(function(){
// VALIDATION FORMULAIRE INSCRIPTION//   // VALIDATION FORMULAIRE CREATION POST IT //
    var dialogs = ['#dialogAge','#dialogFirstName','#dialogLastName','#dialogPs','#dialogMdpEmpty','#dialogMdpMinLength','#dialogMail','#dialogProfil','#dialogTitlePostIt','#dialogCorpsPostIt','#dialogPhotoArt','#dialogTitlePostItLength'];
    $( function() {
        for(var i = 0; i < dialogs.length; i++){
            $(dialogs[i]).dialog({
            autoOpen: false,
            show: {
                effect: 'shake',
                duration: 500
            },
            hide: {
                effect: 'clip',
                duration: 500
            }
        });
    }
    $( '#postMdpLost,#LogIn' ).submit(function(event) {         
        if($('#prenom').val() === ''){
            event.preventDefault();
            $( '.dialogPrenom' ).dialog( 'open' );
            $('.dialogPrenom, body').click(function(){
                $('.dialogPrenom').dialog('close');
            })
        }

        else if($('#nom').val() === ''){
            event.preventDefault();
            $( '.dialogNom' ).dialog( 'open' );
            $('.dialogNom, body').click(function(){
                $('.dialogNom').dialog('close');
            })
        }
        else if($('#email').val() === ''){
            event.preventDefault();
            $( '.dialogEmail' ).dialog( 'open' );
            $('.dialogEmail, body').click(function(){
                $('.dialogEmail').dialog('close');
            })
        }
        else if($('#file').val() === ''){
            event.preventDefault();
            $( '.dialogPicProfil' ).dialog( 'open' );
            $('.dialogPicProfil, body').click(function(){
                $('.dialogPicProfil').dialog('close');
            })
        }
        else if($('#pseudo').val() === ''){
            event.preventDefault();
            $( '.dialogPseudo' ).dialog( 'open' );
            $('.dialogPseudo, body').click(function(){
                $('.dialogPseudo').dialog('close');
            })
        }
        else if($('#password').val() === ''){
            event.preventDefault();
            $( '.dialogPasswordEmpty' ).dialog( 'open' );
            $('.dialogPasswordEmpty, body').click(function(){
                $('.dialogPasswordEmpty').dialog('close');
            })
        }
        else if($('#password').val().length < 8 && $('#password').val()){
            event.preventDefault();
            $( '.dialogPasswordMinLength' ).dialog( 'open' );
            $('.dialogPasswordMinLength, body').click(function(){
                $('.dialogPasswordMinLength').dialog('close');
            })
        }

    });
    
 /*   $( '#creaArticle' ).submit(function(event) {
        if($('#titre').val() === ''){
            event.preventDefault();
            $( '.dialogTitle' ).dialog( 'open' );
            $('.dialogTitle, body').click(function(){
                $('.dialogTitle').dialog('close');
            })
        }
      /*  else if($('#titre').val().length > 10 ){
            event.preventDefault();
            $( '.dialogTitleLength' ).dialog( 'open' );
            $('.dialogTitleLength, body').click(function(){
                $('.dialogTitleLength').dialog('close');
            })
        }
        else if($('#corpsArticle').val() === ''){
            event.preventDefault();
            $( '.dialogArea' ).dialog( 'open' );
            $('.dialogArea, body').click(function(){
                $('.dialogArea').dialog('close');
            })
        }
        else if($('#photoArticle').val() === '' && $('#lienPhotoPost').val() === ''){
            event.preventDefault();
            $( '.dialogPicArt' ).dialog( 'open' );
            $('.dialogPicArt, body').click(function(){
                $('.dialogPicArt').dialog('close');
            })
        }
        if($('#lienPhotoPost').val()){
            $('#photoArticle').val() = 'ok';
            alert('val ok')
        }
        if($('#photoArticle').val()){
            $('#lienPhotoPost').disabled = true;
        }
    });
    */
  });
});