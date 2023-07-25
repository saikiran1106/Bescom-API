const did = document.getElementById("DID");
const mobile = document.getElementById("mobile");
const loginbutton = document.getElementById("loginbutton");

did.addEventListener("input", validateForm );
mobile.addEventListener("input", validateForm );

function validateForm() {
 const didvalue = did.value.trim();
 const mobilevalue = mobile.value.trim();
    if (didvalue !== "" || mobilevalue !== "") {
        loginbutton.disabled = false;
    } else {
        loginbutton.disabled = true;
    }
}