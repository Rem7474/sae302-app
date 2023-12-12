//AUTHOR : Rémy CUVELIER
//DATE : 11/12/2023
//VERSION : 1.0
//DESCRIPTION : Fichier javascript pour l'application mobile
//PLUGINS : community-cordova-plugin-nfc, cordova-plugin-codescanner

document.addEventListener('deviceready', onDeviceReady, false);
//document.getElementById("scan").addEventListener("click", startScan, false);
console.log("coucou");
function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById("scan").addEventListener("click", startScan, false);
    // Vérifier si le NFC est disponible
    nfc.enabled(
      function() {
          console.log("NFC est disponible!");
          nfc.readerMode(
            nfc.FLAG_READER_NFC_A | nfc.FLAG_READER_NO_PLATFORM_SOUNDS, 
            nfcTag => console.log(nfc.bytesToHexString(nfcTag.id)),
            error => console.log('NFC reader mode failed', error)
        );
      },
      function() {
          console.log("NFC n'est pas disponible sur cet appareil.");
      }
  );
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