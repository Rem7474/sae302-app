//AUTHOR : Rémy CUVELIER
//DATE : 11/12/2023
//VERSION : 1.0
//DESCRIPTION : Fichier javascript pour l'application mobile
//PLUGINS : community-cordova-plugin-nfc, cordova-plugin-codescanner

//VARIABLE TEST
//METTRE A FALSE POUR TESTER AVEC LES PLUGINS
let test = false;
if (test){
  console.log("test");
  eventListeners();
}

document.addEventListener('deviceready', onDeviceReady, false);
console.log("Chargement de l'application");


//EVENTS LISTENERS
function eventListeners(){
  //Boutons du menu principal
  let buttons = document.getElementsByClassName("main_button");
  for(let i = 0; i < buttons.length; i++){
    buttons[i].addEventListener("click", addAnimation, false);
  }
  //Bouton pour lancer le scan
  document.getElementById("scan").addEventListener("click", startScan, false);

  //Event pour vérifier si l'appareil est hors ligne
  document.addEventListener("offline", OffLineError, false);
}

//Initialisation et vérification des plugins et de l'API
function init(){
  //ETAPE 1 : Vérifier si le NFC est disponible
  nfc.enabled(
    function() {
        console.log("NFC est disponible!");
    },
    function() {
        console.log("NFC n'est pas disponible sur cet appareil.");
        Display_Error("NFC indisponible", "init", "NFC n'est pas disponible sur cet appareil.")
    }
  );
  //ETAPE 2 : vérifier l'état de l'API (si elle est disponible)
  
}
//FONCTION : onDeviceReady
function onDeviceReady() {
  console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
  /*--------------------------------------------------------------------------*/
  //EVENTS LISTENERS
  eventListeners();
  /*--------------------------------------------------------------------------*/
  //INITIALISATION
  init();
}


/*TEST ANIMATION*/
function addAnimation(event){
  let button = event.currentTarget;

  //Animation de click
  button.classList.add("click");
  setTimeout(function(){
    button.classList.remove("click");
  }, 500);

  let target = event.currentTarget.id;
  let card;
  let close;
  switch(target){
    case "add_user":
      OpenWindow(target);
      //event pour valider le formulaire :
      document.getElementById("formulaire_add_user").addEventListener("submit", Add_User, false);
      updateForm(["card_uid", "user_name", "user_firstname", "user_nbconsos"]);
      if (!test){
        nfc.readerMode(
          nfc.FLAG_READER_NFC_A | nfc.FLAG_READER_NO_PLATFORM_SOUNDS, 
          nfcTag => {
            document.getElementById("card_uid").value = nfc.bytesToHexString(nfcTag.id);
            document.getElementById("card_uid_div").classList.add("is-dirty");
          },
          error => console.log('NFC reader mode failed', error)
        );
      }
      break;
    case "update_product":
      //update ou add d'un produit
      console.log("update_product");
      OpenWindow(target);
      //event pour valider le formulaire :
      document.getElementById("formulaire_update_product").addEventListener("submit", Update_Product, false);
      //ouverture du scan de code barre
      if (!test){
        ScanUpdateProduct();

      }

      break;
    case "view_products":
      console.log("historique");
      break;
    case "view_users":
      OpenWindow(target);
      if (!test){
        nfc.readerMode(
          nfc.FLAG_READER_NFC_A | nfc.FLAG_READER_NO_PLATFORM_SOUNDS, 
          nfcTag => {
            //appelle de la fonction pour faire la requête ajax et afficher les infos de l'utilisateur
            document.getElementById("view_card_uid").value = nfc.bytesToHexString(nfcTag.id);
            document.getElementById("view_card_uid_div").classList.add("is-dirty");
            view_User(nfc.bytesToHexString(nfcTag.id));
          },
          error => console.log('NFC reader mode failed', error)
        );
      }
      break;
    default:
      console.log("erreur");
      break;
  }
}



//FONCTIONS
//FONCTION : OffLineError
//DESCRIPTION : Affiche une erreur lorsque l'appareil est hors ligne
function OffLineError(){
  alert("Vous êtes hors ligne");

}
function OpenWindow(id){
  card = document.getElementById("card_"+id);
  card.classList.add("animation_form");
  card.classList.remove("hidden");
  //event pour fermer la fenetre :
  close = document.getElementById("cancel_"+id);
  close.addEventListener("click", CloseWindow, false);
  card.addEventListener("click", CloseWindow, false);
}
function CloseWindow(event){
  if(event.target.id == "card_add_user" || event.target.id == "cancel_add_user" || event.target.id =="formulaire_add_user"){ //a modifier pour fermeture quand envoie
    CloseAnimation("card_add_user");
    //reset du formulaire
    updateForm(["card_uid", "user_name", "user_firstname", "user_nbconsos"]);
  }
  if(event.target.id == "card_view_users" || event.target.id == "cancel_view_users"){
    CloseAnimation("card_view_users");
    //reset du formulaire
    updateForm(["view_card_uid", "view_user_name", "view_user_firstname", "view_user_nbconsos"]);
  }
}
function CloseAnimation(id){
  let card = document.getElementById(id);
  card.classList.remove("animation_form");
  card.classList.add("animation_form_close");
  setTimeout(function(){
    card.classList.add("hidden");
    card.classList.remove("animation_form_close");
  }, 475);
}
function updateForm(ids){
  //reset des valeurs
  div_ids=[];
  for (let i = 0; i < ids.length; i++){
    document.getElementById(ids[i]).value = "";
    div_ids.push(ids[i]+"_div");
  }
  for (let i = 0; i < div_ids.length; i++){
    document.getElementById(div_ids[i]).classList.remove("is-dirty", "is-invalid", "is-upgraded");
  }
}
function startScan(){
  console.log("startScan");
  cordova.plugins.barcodeScanner.scan(
  function (result) {
    //appel de la fonction pour ajouter au panier, avec le code barre en paramètre (+pour le premier article affiches les boutons de suppression et de validation)
    Ajout_panier(result.text);
  },
  function (error) {
      alert("Scanning failed: " + error);
  },
  {
      preferFrontCamera : false, // iOS and Android
      showFlipCameraButton : false, // iOS and Android
      showTorchButton : true, // iOS and Android
      torchOn: true, // Android, launch with the torch switched on (if available)
      saveHistory: false, // Android, save scan history (default false)
      prompt : "Placer le code barre a lire dans la zone", // Android
      resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
      formats : "all", // default: all but PDF_417 and RSS_EXPANDED
      orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
      disableAnimations : true, // iOS
      disableSuccessBeep: true // iOS and Android
  }
);
}
function Ajout_panier(code_barre){
  //ajout au panier
  //affichage des boutons de suppression et de validation
  //affichage du prix total
  //ETAPE 1 : on test si le produit est déjà dans le panier
  //ETAPE 2 : on récupère le prix et le nom du produit avec une requête ajax
  //ETAPE 3 : on affiche le prix total
  //ETAPE 4 : on affiche les boutons de suppression et de validation
  //ETAPE 5 : on affiche le panier
  //ETAPE 6 : on affiche le prix total

  //ETAPE 1
  let deja_present = false;


  //ETAPE 2
  let prix = 0;
  let nom = "";
  let quantite = 1;
  API_infos_Article(code_barre)
    .then(data => {
      let infos = JSON.parse(data);
      console.log(JSON.stringify(infos));
      console.log("bouh");
      //TOUT METTRE ICI car ASYNCHRONE
    })
    .catch(error => {
        //ERROR réseau
    });
}
function API_infos_Article(barcode){
let url = "https://api.sae302.remcorp.fr/sae302-api/getProduct.php?barcode="+barcode;
return fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        return JSON.stringify(data);
    })
    .catch(error => {
        throw error;
    });
}
function Add_User(event){
  event.preventDefault();
  //récupération des données du formulaire
  let uid= document.getElementById("card_uid").value;
  let nom = document.getElementById("user_name").value;
  let prenom = document.getElementById("user_firstname").value;
  let nbconsos = document.getElementById("user_nbconsos").value;
  //appele de l'API
  API_add_User(uid, nom, prenom, nbconsos)
    .then(status => {
      if (status == "User added") {
        // Affichage de la confettis
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.8 }
        });
      } else {
        Display_Error("Erreur :" + status, "API_add_User", status);
      }
    })
    .catch(error => {
      Display_Error("Erreur Réseau", "API_add_User", error.message);
    })
    .finally(() => {
      CloseWindow(event);
    });

}
function view_User(uid){
  //appelle de la fonction pour afficher les infos de l'utilisateur
  API_infos_User(uid)
    .then(response => {
      if (!response.ok) {
        Display_Error("Erreur Réseau" ,"view_User",response.status);
      }
      return response.json();
    })
    .then(data => {
      console.log(JSON.stringify(data));
      if (data.message == "User found") {
        document.getElementById("view_user_name").value = data.utilisateur_nom;
        document.getElementById("view_user_name_div").classList.add("is-dirty");
        document.getElementById("view_user_firstname").value = data.utilisateur_prenom;
        document.getElementById("view_user_firstname_div").classList.add("is-dirty");
        document.getElementById("view_user_nbconsos").value = data.utilisateur_conso;
        document.getElementById("view_user_nbconsos_div").classList.add("is-dirty");
      }
      else{
        Display_Error("Erreur :" + data.message, "view_User", data.message);
      }
    })
    .catch(error => {
        Display_Error("Erreur :" + error, "view_User", error);
    });

}
function Update_Product(event){
  event.preventDefault();
  //ETAPE 1 : scan du code barre
  //ETAPE 2 : récupération des infos du produit avec une requête ajax pour savoir si il existe
  //ETAPE 3 : si il existe on affiche les infos dans le formulaire
  //ETAPE 4 : si il n'existe pas on le crée
  //ETAPE 5 : on update son stock avec une requête ajax
  //ETAPE 6 : on affiche le message de confirmation
  
  
}
function API_infos_User(uid){
  let url = "https://api.sae302.remcorp.fr/sae302-api/getUser.php?id="+uid;
  return fetch(url)    
}
function API_add_User(uid, nom, prenom, nbconsos){
  let url = "https://api.sae302.remcorp.fr/sae302-api/createUser.php?id="+uid+"&nom="+nom+"&prenom="+prenom+"&nbconso="+nbconsos;
  return fetch(url)
  .then(response => {
    if (!response.ok) {
      Display_Error("Erreur Réseau" ,"API_add_User",response.status);
    }
    return response.json();
  })
  .then(data => {
    console.log(JSON.stringify(data));
    return data.message;
  })
  .catch(error => {
      throw error;
  });
}
function API_infos_Article(barcode){
  let url = "https://api.sae302.remcorp.fr/sae302-api/getProduct.php?barcode="+barcode;
  return fetch(url)
}
function Display_Error(message, fonction, details){
  alert(message);
  console.log(details);
  console.log("Erreur de :"+fonction);
}
function ScanUpdateProduct(){
  //ouverture du scan de code barre puis appel de la fonction pour récupérer les infos du produit
  cordova.plugins.barcodeScanner.scan(
    function (result) {
      API_infos_Article(result.text)
        .then(response => {
        if (!response.ok) {
          Display_Error("Erreur Réseau" ,"ScanUpdateProduct",response.status);
        }
        return response.json();
      })
        .then(data => {
          if (data.message == "Product found") {
            //affiche les infos dans le formulaire
            

          }
          else{
            //laisse l'utilisateur remplir le formulaire en sachant qu'il faudra créer le produit
          }
        })
        .catch(error => {
            //ERROR réseau
        });
    },
    function (error) {
        alert("Scanning failed: " + error);
    },
    {
        preferFrontCamera : false, // iOS and Android
        showFlipCameraButton : false, // iOS and Android
        showTorchButton : true, // iOS and Android
        torchOn: true, // Android, launch with the torch switched on (if available)
        saveHistory: false, // Android, save scan history (default false)
        prompt : "Placer le code barre a lire dans la zone", // Android
        resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
        formats : "all", // default: all but PDF_417 and RSS_EXPANDED
        orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
        disableAnimations : true, // iOS
        disableSuccessBeep: true // iOS and Android
    }
  );
}