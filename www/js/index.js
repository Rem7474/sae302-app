//AUTHOR : Rémy CUVELIER
//DATE : 11/12/2023
//VERSION : 1.0
//DESCRIPTION : Fichier javascript pour l'application mobile
//PLUGINS : community-cordova-plugin-nfc

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