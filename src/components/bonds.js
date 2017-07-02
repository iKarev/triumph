
const fullBondsData = [];
let price = 200;
const start = new Date();
let startYear = start.getFullYear(),
    startMonth = start.getMonth(),
    startDate = start.getDate()
let day = 1;
for (let i = 0; i < 300; i++) {
    if (i%2) 
        price += parseInt(Math.random()*100);
    else 
        price -= parseInt(Math.random()*50);
    const dayYield = parseInt(price / (1000/(1000+parseInt(Math.random()*300))));
    const spread = dayYield - price;
    const date = new Date(startYear,startMonth,startDate);
    fullBondsData.unshift({price, yield: dayYield, spread, date})
    startDate -= (1 + parseInt(Math.random() * 3));
}

const getBondsData = function (period, date) {
    let bonds;
    let endDate = fullBondsData[fullBondsData.length - 1].date;
        startDate;
    let eYear = endDate.getFullYear(),
        eMonth = endDate.getMonth(),
        eDate = endDate.getDate()
    switch (period) {
        case 'week':
            startDate = fullBondsData.find(bond => bond.date >= new Date(eYear, eMonth, eDate - 7)).date;
            bonds = fullBondsData.filter(bond => bond.date > startDate && bond.date <= endDate);
            break;
        case 'month':
            startDate = fullBondsData.find(bond => bond.date >= new Date(eYear, eMonth, eDate - 30)).date;
            bonds = fullBondsData.filter(bond => bond.date > startDate && bond.date <= endDate);
            break;
        case 'quater':
            startDate = fullBondsData.find(bond => bond.date >= new Date(eYear, eMonth, eDate - 91)).date;
            bonds = fullBondsData.filter(bond => bond.date > startDate && bond.date <= endDate);
            break;
        case 'year':
            startDate = fullBondsData.find(bond => bond.date >= new Date(eYear, eMonth, eDate - 365)).date;
            bonds = fullBondsData.filter(bond => bond.date > startDate && bond.date <= endDate);
            break;
        default:
            bonds = fullBondsData;
    }
    return bonds;
}

export default getBondsData;