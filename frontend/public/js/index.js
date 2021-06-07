

//update to get from api endpoint
function getCatagories()  {
    let catagories = [
        "analytics",
        "application_integration",
        "ar_and_vr",
        "aws_cost_management",
        "blockchain",
        "business_application",
        "compute",
        "database",
        "developer_tools",
        "end_user_computing",
        "game_tech",
        "internet_of_things",
        "machine_learning",
        "management_and_governance",
        "media_services",
        "migration_and_transfer",
        "mobil",
        "networking_and_content_delivery",
        "quantum_technologies",
        "robotics",
        "satellite",
        "security_and_compliance",
        "storage"
    ]

    return catagories;
}

function loadCatagories () {
    let select = document.getElementById('catagories');
    let options = getCatagories().map(catagory =>`<option value=${catagory}>${catagory}</option>`).join('\n');
    select.innerHTML = options;
}

function setCatagory() { 
    localStorage.setItem("currentCatagory", document.getElementById("catagories").value);
}

loadCatagories();