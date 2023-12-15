//AUTHOR : Rémy CUVELIER
//DATE : 11/12/2023
//VERSION : 1.0
//DESCRIPTION : Fichier javascript pour l'application mobile
//PLUGINS : community-cordova-plugin-nfc, cordova-plugin-codescanner

//VARIABLE TEST
//METTRE A FALSE POUR TESTER AVEC LES PLUGINS
let test = true;
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
  switch(target){
    case "add_user":
      let card = document.getElementById("card_"+target);
      card.classList.add("animation_form");
      card.classList.remove("hidden");
      //event pour fermer la fenetre :
      let close = document.getElementById("cancel_add_user");
      close.addEventListener("click", CloseWindow, false);
      card.addEventListener("click", CloseWindow, false);
      //event pour valider le formulaire :
      document.getElementById("formulaire_add_user").addEventListener("submit", Add_User, false);
      if (!test){
        nfc.readerMode(
          nfc.FLAG_READER_NFC_A | nfc.FLAG_READER_NO_PLATFORM_SOUNDS, 
          nfcTag => {
            document.getElementById("card_uid").value = nfc.bytesToHexString(nfcTag.id);
            document.getElementById("card_uid_label").style.display = "none";
          },
          error => console.log('NFC reader mode failed', error)
        );
      }
      break;
    case "add_product":
      console.log("panier");
      break;
    case "view_products":
      console.log("historique");
      break;
    case "view_users":
      console.log("parametres");
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
function CloseWindow(event){
  if(event.target.id == "card_add_user" || event.target.id == "cancel_add_user"){ //a modifier pour fermeture quand envoie
    let card = document.getElementById("card_add_user");
    card.classList.remove("animation_form");
    card.classList.add("animation_form_close");
    setTimeout(function(){
      card.classList.add("hidden");
      card.classList.remove("animation_form_close");
    }, 999);
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
  API_add_User(uid, nom, prenom, nbconsos);
}
function API_add_User(uid, nom, prenom, nbconsos){
  let url = "https://api.sae302.remcorp.fr/sae302-api/createUser.php?id="+uid+"&nom="+nom+"&prenom="+prenom+"&nbconso="+nbconsos;
  fetch(url, {
    method: 'GET'
  })
  .then(response => {
    if (!response.ok) {
      Display_Error("Erreur Réseau" ,"API_add_User",response.status);
    }
    return response.json();
  })
  .then(data => {
    console.log(JSON.stringify(data));
    if(data.status == "success"){
      let card = document.getElementById("card_add_user");
      card.classList.remove("animation_form");
      card.classList.add("animation_form_close");
      setTimeout(function(){
        card.classList.add("hidden");
        card.classList.remove("animation_form_close");
      }, 999);
    }
    else{
      //ajout en paramètre du nom de la fonction qui appelle l'erreur
      Display_Error("Erreur de l'ajout" ,"API_add_User",data.message);
    }
  })
  .catch(error => {
      throw error;
  });
}
function Display_Error(message, fonction, details){
  alert(message);
  console.log(details);
  console.log("Erreur de :"+fonction);
}