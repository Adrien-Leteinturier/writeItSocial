$(document).ready(function(){

    $('#loginForm').validator().on('submit', function (event) {

        if($('#pseudo').val() === ''){
        event.preventDefault();
        $("#pseudo").notify("Veuillez renseigner un Pseudo", { position:"top left" });
        } else {
        
        }
    })

// VALIDATION FORMULAIRE INSCRIPTION//   // VALIDATION FORMULAIRE CREATION POST IT //
/*    var dialogs = [
        '#dialogAge',
        '#dialogFirstName',
        '#dialogLastName',
        '#dialogPs',
        '#dialogMdpEmpty',
        '#dialogMdpMinLength',
        '#dialogMail',
        '#dialogProfil',
        '#dialogCorpsPostIt',
        '#dialogPhotoArt'
        ];
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
            
        $( '#form-create-post' ).submit(function(event) {
            if($('#create-post-textarea').val() === ''){
                event.preventDefault();
                $( '.dialogArea' ).dialog( 'open' );
                $('.dialogArea, body').click(function(){
                    $('.dialogArea').dialog('close');
                })
            }
            else if($('#file').val() == ''){
                console.log('empty')
                event.preventDefault();
                console.log('prevent')
                $( '.dialogPicArt' ).dialog( 'open' );
                console.log('open')
                $('.dialogPicArt, body').click(function(){
                    $('.dialogPicArt').dialog('close');
                })
            }
        });
            
    });*/

});