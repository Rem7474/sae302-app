//FONCTIONS API
function API_Get_User(uid){
    let url = "https://api.sae302.remcorp.fr/sae302-api/getUser.php?id="+uid;
    return fetch(url)    
  }
  function API_add_User(uid, nom, prenom, nbconsos){
    let url = "https://api.sae302.remcorp.fr/sae302-api/createUser.php?id="+uid+"&nom="+nom+"&prenom="+prenom+"&nbconso="+nbconsos;
    return fetch(url)
  }
  function API_Get_Product(barcode){
    let url = "https://api.sae302.remcorp.fr/sae302-api/getProduct.php?barcode="+barcode;
    return fetch(url)
  }
  function API_Add_Product(barcode, name, order_price, sell_price){
    let url = "https://api.sae302.remcorp.fr/sae302-api/createProduct.php?barcode="+barcode+"&nom="+name+"&prixachat="+order_price+"&prixvente="+sell_price;
    return fetch(url)
  }
  function API_Update_Product(barcode, name, order_price, sell_price){
    let url = "https://api.sae302.remcorp.fr/sae302-api/updateProduct.php?barcode="+barcode+"&nom="+name+"&prixachat="+order_price+"&prixvente="+sell_price;
    return fetch(url)
  }
  function API_Get_Stock(barcode){
    let url = "https://api.sae302.remcorp.fr/sae302-api/getStock.php?barcode="+barcode;
    return fetch(url)
  }
  function API_Get_All_Stock(){
    let url = "https://api.sae302.remcorp.fr/sae302-api/getAllStock.php";
    return fetch(url)
  }
  function API_Add_Stock(barcode, stock){
    let url = "https://api.sae302.remcorp.fr/sae302-api/addStock.php?barcode="+barcode+"&stock="+stock;
    return fetch(url)
  }
  function API_Update_Stock(barcode, stock){
    let url = "https://api.sae302.remcorp.fr/sae302-api/updateStock.php?barcode="+barcode+"&stock="+stock;
    return fetch(url)
  }
  function API_Add_Vente(uid, barcode, quantite){
    let url = "https://api.sae302.remcorp.fr/sae302-api/addSale.php?iduser="+uid+"&barcode="+barcode+"&quantite="+quantite;
    return fetch(url)
  }
function API_Get_Ventes_Historique(){
    let url = "https://api.sae302.remcorp.fr/sae302-api/getAllSales.php";
    return fetch(url)
}
function API_Add_Conso(uid,nbconsos){
    let url = "https://api.sae302.remcorp.fr/sae302-api/updateConso.php?id="+uid+"&nbconso="+nbconsos;
    return fetch(url)
}
  //FUNCTIONS AUTRES
async function NFC_Read() {
    return Promise.race([
      new Promise((resolve, reject) => {
        nfc.readerMode(
          nfc.FLAG_READER_NFC_A | nfc.FLAG_READER_NO_PLATFORM_SOUNDS, 
          nfcTag => {
            nfc.disableReaderMode(
              () => {
                console.log('NFC reader mode disabled');
                console.log('NFC tag scanned', nfcTag.id);
                resolve(nfc.bytesToHexString(nfcTag.id));
              },
              error => {
                console.log('Error disabling NFC reader mode', error);
                reject(error);
              }
            );
          },
          error => {
            console.log('NFC reader mode failed', error);
            reject(error);
          }
        );
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout after 15 seconds')), 15000))
    ]);
}