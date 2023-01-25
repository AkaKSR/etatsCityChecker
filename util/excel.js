const Excel = require('exceljs');

const xlsxFile = "./city_checker.xlsx";

async function loadFile() {
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(xlsxFile);

    return workbook;
}


async function getCities(worksheet) {
    let result = [];

    for (var i = 3; i < worksheet.rowCount; i++) {
        var row = worksheet.getRow(i);
        var cell = row.getCell("A");

        if (cell.value != null) {
            result.push({
                idx: cell._row._number,
                val: cell.value
            });
        }
    }

    return result;
}

async function setData(workbook, worksheet, dataArr) {
    for (var i = 0; i < dataArr.length; i++) {
        var row = worksheet.getRow(dataArr[i].idx);

        // 주지사 ID
        var cell = row.getCell("B");
        cell.value = dataArr[i].id;

        // 주지사 명
        cell = row.getCell("C");
        cell.value = dataArr[i].name;

        // 접속여부
        cell = row.getCell("D");
        cell.value = dataArr[i].result;

        // 일치여부
        cell = row.getCell("E");
        if (!dataArr[i].isGovernor) {
            cell.value = "수정 필요";
            
            // XXX ExcelJS에서 특정 셀에서 색상 지정이 안되고 있다.
            // cell.font = {
            //     color: { argb: 'FFFF0000' }
            // };
        }
    }

    await workbook.xlsx.writeFile(xlsxFile);
}

module.exports = {
    loadFile,
    getCities,
    setData
}