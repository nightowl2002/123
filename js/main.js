var page = 1;
const perPage = 8;

let companyObjectToTableRowTemplate = company => {
    
    var [obase, ooffices, omid, odate, oend, otags, otag1, otag2] = ``;

    obase =
    `<tr data-id=${company._id}>
        <td>${company.name}</td>
        <td>${company.description ? company.description : `<b>--</b>`}</td>
        <td>${company.number_of_employees ? company.number_of_employees : `<b>--</b>`}</td>
        `;
    
    ooffices =
    `   <td>`
    
    if (company.offices[0] && company.offices[0] != null) {
        ooffices +=
        `${company.offices[0].city}`
        if (company.offices[0].state_code && company.offices[0].state_code != null) {
            ooffices +=
            `, ${company.offices[0].state_code}`
            if (company.offices[0].country_code && company.offices[0].country_code != null) {
                ooffices += 
                `, ${company.offices[0].country_code}</td>
                `
            } else {
                ooffices +=
                `</td>
                `
            }
        } else {
            ooffices +=
            `</td>
            `
        }
    } else {
        ooffices +=
        `<b>--</b></td>
        `
    }

    omid =
    `   <td>${company.category_code}</td>
    `

    odate =
    `   <td>`
    
    if (company.founded_year && company.founded_year != null) {
        
        if (company.founded_month && company.founded_month != null) {
            odate +=
            `${company.founded_month}/`
            if (company.founded_day && company.founded_day != null) {
                odate +=
                `${company.founded_day}/`
            }
        }
        odate +=
        `${company.founded_year}</td>
        `
    } else {
        odate +=
        `<b>--</b></td>
        `
    }
    
    oend =
    `   <td>${company.homepage_url}</td>`
    
    otags =
    `   <td>`
    
    if (company.tag_list && company.tag_list != null) {
        otag1 = company.tag_list.split(', ')[0]
        otags +=
        `${otag1}`
        otag2 = company.tag_list.split(', ')[1]
        if (otag2 && otag2 != null) {
            otags +=
            `, ${otag2}`
        }
    } else {
        otags +=
        `<b>--</b>`
    }

    otags +=
    `</td>
    </tr>`

    return obase + ooffices + omid + odate + oend + otags}

function loadCompanyData(name = null) {
    let url = ""

    const div = document.getElementsByClassName("pagination");

    if (name && name != null) {
        url = `api/companies?page=${+page}&perPage=${+perPage}&name=${name}`
        div[0].classList.add("d-none");
    } else {
        url = `api/companies?page=${+page}&perPage=${+perPage}`
        div[0].classList.remove("d-none");
    }

    console.log(url)

    fetch(url).then(res => res.json()).then(data => {    
        let companyRows = `
        ${data.map(company => companyObjectToTableRowTemplate(company)).join('')}
        `;

        document.querySelector('#companyTable tbody').innerHTML = companyRows;
        
        document.querySelector('#current-page').innerHTML = page;

        document.querySelectorAll('#companyTable tbody tr').forEach(row => {
            row.addEventListener("click", e => {
                
                let clickedId = row.getAttribute("data-id");

                fetch(`api/company/${clickedId}`).then(res => res.json()).then(data => {
                    
                    console.log(data);
                    
                    let singleCompanyInfo = `
                    <strong>Category:</strong> ${data.category_code}<br /><br />
                    <strong>Description:</strong> ${data.description}<br /><br />
                    <strong>Overview:</strong>
                    ${data.overview}
                    <strong>Tag List:</strong> ${data.tag_list}<br />
                    <strong>Founded:</strong> ${new Date(data.founded_year, data.founded_month, data.founded_day).toLocaleString('en-us',{month:'short', day:'numeric', year:'numeric'})}<br /><br />
                    <strong>CEOs:</strong> `

                    var people = [];
                    data.relationships.forEach(relationed => {
                        if (relationed.title.includes("CEO")) {
                            people.push(relationed);
                        }
                    });

                    if (people.length > 0) {
                        people.forEach(relationed => {
                            singleCompanyInfo += `${relationed.person.first_name} ${relationed.person.last_name} (${relationed.title})`
                            if (relationed == people[people.length - 1]) {
                                singleCompanyInfo +=
                                `<br /><br />
                                `
                            } else {
                                singleCompanyInfo +=
                                `, `;
                            }
                        });
                    } else {
                        singleCompanyInfo +=
                        `No persons listed. Information needed!<br /><br />
                        `
                    }

                    singleCompanyInfo +=
                    `<strong>Products:</strong>`

                    if (data.products.length > 0) {
                        singleCompanyInfo +=
                        `
                        <ul>
                        `
                        data.products.forEach(product => {
                            singleCompanyInfo +=
                            `  <li>${product.name}</li>
                            `
                        });
                        singleCompanyInfo +=
                        `</ul>
                        `
                    } else {
                        singleCompanyInfo +=
                        ` This company has made no products.<br /><br />
                        `
                    }
                    

                    singleCompanyInfo +=
                    `<strong>Number of Employees:</strong> ${data.number_of_employees}<br /><br />
                    <strong>Website:</strong> ${data.homepage_url}<br /><br />
                    `
                    
                    document.querySelector("#detailsModal .modal-body").innerHTML = singleCompanyInfo;

                    let modal = new bootstrap.Modal(document.getElementById("detailsModal"), {
                        backdrop: "static",
                        keyboard: false
                    });

                    modal.show();

                });
            });
        });
    });
}


document.addEventListener('DOMContentLoaded', function () {
    
    loadCompanyData();

    document.querySelector("#previous-page").addEventListener('click', event => {
        if (page > 1) {
            page -= 1;
            loadCompanyData();
        }
    });

    document.querySelector("#next-page").addEventListener('click', event => {
        page += 1;
        loadCompanyData();
    });

    document.querySelector("#searchForm").addEventListener('submit', event => {
        // prevent the form from from 'officially' submitting
        event.preventDefault();
        // populate the posts table with the pageSel value
        loadCompanyData(document.querySelector("#name").value);
    });

    document.querySelector("#clearForm").addEventListener('click', event => {
        document.querySelector("#name").value = ``;
        loadCompanyData();
    });
    
});
