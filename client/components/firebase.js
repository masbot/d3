import firebase from 'firebase'
var config = {
    apiKey: "AIzaSyAli77ZysmTAh1uzz3mUIq2xM7xVtqSg2Y",
    authDomain: "d3-project-9ea4e.firebaseapp.com",
    databaseURL: "https://d3-project-9ea4e.firebaseio.com",
    projectId: "d3-project-9ea4e",
    storageBucket: "d3-project-9ea4e.appspot.com",
    messagingSenderId: "151405542443"
};
let fire = firebase.initializeApp(config);
let db = fire.firestore();
db.settings({ timestampsInSnapshots: true });  
export default db;