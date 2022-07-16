import { initializeApp } from 'firebase/app'
import { getFirestore, doc } from 'firebase/firestore'

const firebaseApp = initializeApp({
    apiKey: "AIzaSyBrq2JGONrkH7G2DGnHp9zVzZgN-a_Q56Y",
    authDomain:"practica-calificada-12-202bb.firebaseapp.com",
    projectId: "practica-calificada-12-202bb",
    storageBucket: "practica-calificada-12-202bb.appspot.com",
    messagingSenderId: "230322545138",
    appId: "1:230322545138:web:06510417997b91e1accb6b",
    measurementId: "G-MSZYVQ7J54"
})

const firestore = getFirestore();

export {
    firestore,
    doc
}