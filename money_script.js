import { getDatabase, ref, push, set, get, child, update, remove, getAuth, signInWithEmailAndPassword, onValue, onChildAdded, signInWithPopup, GoogleAuthProvider, getRedirectResult, signInWithRedirect } from './configuration.js'

// TO-DO. Before any insertion check the database if that user is allowed to do it, before user performs any task, check the data from local database.


const database = getDatabase();
let user = {
    uid: '',
    email: ''
};
let transactionData = [];


window.addEventListener('load', function () {
    checeIfUserLogged();
    setDate();
});

let curDate = '';














// Looks for changes at the database, and instantly sends a snapshot of a change. At this time, fetches new data - Later update just the table row. NEEDS WORK!
onValue(ref(database, '/transactions/' + user.uid), (snapshot) => {
    transactionData = [];
    document.getElementById('pushDataHere').innerHTML = "";
    getAllData();

});

/* 
                Login logic 
------------------------------------------------------
*/

// let email = document.getElementById("email");
// let password = document.getElementById("password");
let loginBtn = document.getElementById("loginBtn");
let logoutBtn = document.getElementById('logoutBtn');
// loginBtn.addEventListener('click', loginUser);
logoutBtn.addEventListener('click', removeUserFromStorage);

//Login logic
function loginUser() {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email.value, password.value)
        .then((userCredential) => {
            setUserToLocalStorage(userCredential);
            hideLogin();
            showNav();
            showData();
            getAllData();
        })
        .catch((error) => {
            console.log(error);
        });
}

// If page refreshes, check if localStorage has uid, and then check if that matches with database if not remove everything from localStorage and go to login page. - NEEDS WORK !
function checeIfUserLogged() {
    let uid = localStorage.getItem('uid');
    if (!uid) {
        return;
    }
    user.uid = localStorage.getItem('uid');
    user.email = localStorage.getItem('email');
    hideLogin();
    showNav();
    showData();

}


// Logout function
function removeUserFromStorage() {
    localStorage.clear();
    showLogin();
    hideInsert();
    hideData();
    hideNav();
    transactionData = [];
}


//Sets user to local storage
function setUserToLocalStorage(userCredential) {
    user.email = userCredential.user.email;
    user.uid = userCredential.user.uid;


    localStorage.setItem("email", userCredential.user.email);
    localStorage.setItem("uid", userCredential.user.uid);
}

function setUserToLocalStorageFromGoogle(userCredential) {
    user.email = userCredential.email;
    user.uid = userCredential.uid;


    localStorage.setItem("email", userCredential.email);
    localStorage.setItem("uid", userCredential.uid);
}

/* 
                Login logic 
------------------------------------------------------
*/













// Gets all the data from database
function getAllData() {
    if (!user.uid) {
        return;
    }
    const dbRef = ref(database);
    get(child(dbRef, `transactions/${user.uid}/`)).then((snapshot) => {
        if (snapshot.exists()) {
            let listOfItems = snapshot.val();
            for (const item in listOfItems) {
                transactionData.push({ id: item, amount: listOfItems[item].amount, type: listOfItems[item].type });

            }

            fillTable();

        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error(error);
    });

}


// This fills transaction table, to fill data. We push the elements, and then we add click listeners to each button so we can remove
function fillTable() {
    let pushDataHere = document.getElementById("pushDataHere");
    let el = '';
    transactionData.forEach(element => {
        el += createTableRow(element);
    });
    pushDataHere.innerHTML = el;
    addClick();
    removeClick();
}


// This creates dynamic buttons that will be added for each element 
function createTableRow(el) {
    let element = `<tr id="${el.id}">
              
                <td id="amount${el.id}" class="editing">${el.amount}</td>
                <td id="type${el.id}" class="editing">${el.type}</td>
                <td>
                <button id="edit${el.id}" type="button" class="btn btn-warning editClass"><span class="glyphicon glyphicon-edit"></span></button>
                </td>
                <td>
                <button id="remove${el.id}" type="button" class="btn btn-danger removeClass"><span class="glyphicon glyphicon-remove"></span></button>
            </td>
            </tr>
    `;
    return element;
}


// Inserting new data to database !
function insertData() {
    let typeInsert = document.getElementById("typeInsert").value;
    let amountInsert = document.getElementById("amountInsert").value;
    let link = 'transactions/' + user.uid + '/';
    const postListRef = ref(database, link);
    const newPostRef = push(postListRef);
    set(newPostRef, {
        amount: amountInsert,
        type: typeInsert
    }).then(() => {
    }).catch((error) => {
        alert("Action uncessful")
    });
}
//adding onclick functionallity to dynamiclly added element "edit" in createTableRow. We find all buttons with edit button and add onclick="editField" and we pass the parent tr id, so we know what row to edit.
function addClick() {
    let elements = document.getElementsByClassName("editClass");
    for (let i = 0; i < elements.length; i++) {
        elements[i].addEventListener('click', function () {
            editField(elements[i].parentElement.parentElement.id);
        });
    }

}
//adding onclick functionallity to dynamiclly added element "delete" in createTableRow. We find all buttons with remove button and add onclick="deleteElements" and we pass the parent tr id, so we know what row to remove
function removeClick() {
    let elements = document.getElementsByClassName("removeClass");
    for (let i = 0; i < elements.length; i++) {
        elements[i].addEventListener('click', function () {
            deleteData(elements[i].parentElement.parentElement.id);
        });
    }

}

/* After pressing the "edit" button on the page(edit button is dynamiclly added at "createTableRow" function)Logic to make a table TD turn into editable fields (button, select). After pressing the button a flag "pressed" is set to true so we know when we are in "editing" mode and "viewing mode". Pressing edit button for the second time edits the fields and updates at database. We loop thru all children that have class .editing
---------------------------------------------------------------------------------------------------
*/
function editField(id) {
    let currentTDField = document.getElementById('edit' + id);
    let editFieldPressed = false;
    if (!currentTDField.classList.contains('pressed')) {
        currentTDField.classList.add('pressed');
        editFieldPressed = true;
    } else {
        currentTDField.classList.remove('pressed');
        editFieldPressed = false;
    }
    let curEl = document.getElementById(id);
    let allElements = curEl.querySelectorAll('.editing');
    allElements.forEach(e => {
        if (editFieldPressed) {
            if (e.id == 'type' + id) {
                let temp = e.innerHTML.replaceAll(' ', '');
                e.innerHTML = `  
                <select class="form-control" id="selectEdit${id}">
                    <option ${temp == 'Food' ? 'selected' : ''}>Food</option>
                    <option ${temp == 'Gas' ? 'selected' : ''}>Gas</option>
                    <option ${temp == 'Clothing' ? 'selected' : ''}>Clothing</option>
                    <option ${temp == 'Gifts' ? 'selected' : ''}>Gifts</option>
                </select>
                `;


            }
            if (e.id == 'amount' + id) {
                e.innerHTML = `<input id = "btnamount${id}" class="form-control" value = "${e.innerHTML}" /> `;
            }

        } else {
            if (e.id == 'type' + id) {
                e.innerHTML = `<td> ${document.getElementById('selectEdit' + id).value}</td>`;

            } else if (e.id == 'amount' + id) {
                e.innerHTML = `<td> ${document.getElementById('btnamount' + id).value}</td>`;
            }
        }
    });

    if (!editFieldPressed) {
        updateTransaciton(id);

    }
}

/*
---------------------------------------------------------------------------------------------------------
*/


// update transaction to firebase
function updateTransaciton(id) {
    let amount = document.getElementById('amount' + id);
    let type = document.getElementById('type' + id);

    const postData = {
        amount: amount.innerText,
        type: type.innerHTML
    }
    const upp = {};
    upp[`transactions/${user.uid}/${id}`] = postData;
    update(ref(database), upp);


}

//delete transaction to firebase
function deleteData(id) {
    const updates = {};
    updates['/transactions/' + user.uid + '/' + id] = {};
    update(ref(database), updates);
}

//display transaction page and hide other divs
addDataBtn.addEventListener('click', displayAddTransactionPage)
function displayAddTransactionPage() {
    hideData();
    showInsert();
    insertData();
}



/*
NAVBAR MENU adding active to the navbar and hiding other divs to make page "feel" like one page
-------------------------------------------------------------------------------------------------------
*/

document.querySelector('nav ul').addEventListener('click', event => {
    let clicked = event.target;
    let elem = document.querySelector('nav ul li.active');
    elem.classList.remove('active');
    clicked.parentNode.classList.add('active');
    if (clicked.text == 'Transactons') {
        hideInsert();
        showData();
    }
    if (clicked.text == 'Add') {
        showInsert();
        hideData();
    }
    if (clicked.text == 'Stats') {
        hideData();
        hideInsert();
    }
});
/*
-------------------------------------------------------------------------------------------------------
*/


/*
These functions are hidding and showing certain divs depending on what the user wants
---------------------------------------------------------------------------------------
*/
let navDiv = document.getElementById('navHide');
let loginDiv = document.getElementById('loginHide');
let dataDiv = document.getElementById('dataHide');
let insertDiv = document.getElementById('insertHide');


function showNav() {
    navDiv.classList.remove("initHidden");
}
function hideNav() {
    navDiv.classList.add("initHidden");
}

function showData() {

    dataDiv.classList.remove("initHidden");
}

function hideData() {
    dataDiv.classList.add("initHidden");
}

function showInsert() {
    insertDiv.classList.remove("initHidden");
}

function hideInsert() {
    insertDiv.classList.add("initHidden");
}

function showLogin() {
    loginDiv.classList.remove("initHidden");
}
function hideLogin() {
    loginDiv.classList.add("initHidden");
}

/*
---------------------------------------------------------------------------------------
/*



/* Draw Plugin 
----------------------------------------------
*/


/*
google.charts.load('current', { 'packages': ['corechart'] });
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    let data = google.visualization.arrayToDataTable([
        ['Spending', 'Amount'],
        ['food', 250],
        ['gas', 350],
        ['clothing', 770]


    ]);

    var options = {
        title: 'Spending by type'
    };

    var chart = new google.visualization.PieChart(document.getElementById('myChart'));
    chart.draw(data, options);
}
*/

/*
----------------------------------------------
*/

function setDate() {

    let date = dayjs(new Date());
    curDate += date.year();
    curDate += '-' + (date.month() + 1);
    curDate += '-' + date.date();
    console.log(curDate);
}
let provider = new GoogleAuthProvider();

let googleButton = document.getElementById('loginBtnWithGoogle')
googleButton.addEventListener('click', e => {

    const auth = getAuth();
    signInWithRedirect(auth, provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access Google APIs.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;


        }).catch((error) => {
            console.log(error)
            // Handle Errors here.
            // const errorCode = error.code;
            // const errorMessage = error.message;
            // console.log(errorCode);
            // The email of the user's account used.
            // const email = error.customData.email;
            // The AuthCredential type that was used.
            // const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
        });
});

let lol = getRedirectResult(getAuth())
    .then((result) => {
        // This gives you a Google Access Token. You can use it to access Google APIs.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;

        // The signed-in user info.
        const user = result.user;
        console.log(result);
        let re = document.getElementById('pushDataHere');
        re.innerHTML = '';
        transactionData = [];
        setUserToLocalStorageFromGoogle(user);
        hideLogin();
        showNav();
        showData();

    }).catch((error) => {
        console.log(error);

    });



