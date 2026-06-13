export class Matrix {

    public HeaderRow: Row;
    private FirstRow: Row;
    private SecondRow: Row;
    private FirstVariationRow: Row;
    private SecondVariationRow: Row;

    public Matrix: [Row, Row, Row, Row, Row];

    constructor() {
        this.HeaderRow = this.seed({ row: new Row(), seedValue: 'cell not found', seedQuantity: 9 });
        this.FirstRow = this.seed({ row: new Row(), seedValue: 'cell not found', seedQuantity: 9 });
        this.SecondRow = this.seed({ row: new Row(), seedValue: 'cell not found', seedQuantity: 9 });
        this.FirstVariationRow = this.seed({ row: new Row(), seedValue: 'cell not found', seedQuantity: 9 });
        this.SecondVariationRow = this.seed({ row: new Row(), seedValue: 'cell not found', seedQuantity: 9 });
        this.Matrix = [this.HeaderRow, this.FirstRow, this.SecondRow, this.FirstVariationRow, this.SecondVariationRow]
    }

    private seed({ row, seedValue, seedQuantity }: { row: Row, seedValue: string, seedQuantity: number }): Row {
        for (let count = 0; count < seedQuantity; count++) {
            row.addNewCell(new Cell(seedValue));
        }
        return row;
    }

    public addNewRow({ row, type }: { row: Row | string[] | number[], type: 'HeaderRow' | 'FirstRow' | 'SecondRow' }) {

        if (row instanceof Row == false) row = this.convertArrayToRow(row);

        switch (type) {
            case 'HeaderRow':
                if (this.HeaderRow.getCellValue(0) == 'cell not found') this.HeaderRow = row;
                else {
                    const setA = new Set(this.HeaderRow.Cells.map(cell => cell.value));
                    const setB = new Set(row.Cells.map(cell => cell.value));
                    const difference = [...setB.difference(setA)];
                    for (let index = 0; index < difference.length; index++) {
                        this.HeaderRow.addNewCell(new Cell(difference[index]));
                    }
                }
                break;

            case 'FirstRow':
                this.FirstRow = row;
                break;

            case 'SecondRow':
                if (this.SecondRow.getCellValue(0) == 'cell not found') this.SecondRow = row;
                else {
                    this.FirstRow = this.SecondRow;
                    this.SecondRow = row.getCellValue(0) != this.SecondRow.getCellValue(0) && row.getCellValue(1) != this.SecondRow.getCellValue(1)
                        ? row
                        : this.SecondRow
                }
                break;

            default:
                break;
        }
    }

    public setCell({ row, column, newValue }: { row: number, column: number, newValue: any }) {
        this.Matrix[row].Cells[column] = newValue;
    }

    public getNumberRows() {
        return this.Matrix.length;
    }

    public getBodyRows() {
        const bodyRows = [];
        for (let rowNumber = 1; rowNumber < this.Matrix.length; rowNumber++) {
            const bodyRow = this.Matrix[rowNumber];
            bodyRows.push(bodyRow)
        };
        return bodyRows;
    }

    private convertArrayToRow(array: string[] | number[]): Row {
        const convertedRow = new Row();
        for (let index = 0; index < array.length; index++) {
            convertedRow.addNewCell(new Cell(array[index]));
        };
        return convertedRow;
    }

    private createVariationRow({ firstColumnValue, secondColumnValue, typeVariation }: { firstColumnValue: any, secondColumnValue: any, typeVariation: 'percent' | 'point' }): Row {

        const variationRow = new Row();
        variationRow.addNewCell(new Cell(firstColumnValue));
        variationRow.addNewCell(new Cell(secondColumnValue));

        for (let column = 2; column < this.FirstRow.getNumberColumns(); column++) {

            let initialValue = this.FirstRow.getCellValue(column).toString().replace(',', '.');
            let finalValue = this.SecondRow.getCellValue(column).toString().replace(',', '.');

            if (typeVariation === 'point') variationRow.addNewCell(new Cell((+finalValue - +initialValue).toFixed(2)));
            else {
                const variationPercent = ((+finalValue - +initialValue) / +initialValue) * 100;
                variationRow.addNewCell(new Cell(`${variationPercent.toFixed(2)}%`));
            }
        }
        return variationRow;
    }

    private normalizeColumns() {

        const numberColumnsPerRow = [
            this.HeaderRow.getNumberColumns(),
                    this.FirstRow.getNumberColumns(),
                    this.SecondRow.getNumberColumns(),
        ];

        const numberColumnsInAscendingOrder = numberColumnsPerRow.sort((a, b) => a - b);

        const maximumNumberColumns = numberColumnsInAscendingOrder[numberColumnsInAscendingOrder.length - 1] >= numberColumnsInAscendingOrder[numberColumnsInAscendingOrder.length - 2]
            ? numberColumnsInAscendingOrder[numberColumnsInAscendingOrder.length - 1]
            : 0

        this.HeaderRow = this.seed({
            row: this.HeaderRow,
            seedValue: 'cell not found',
            seedQuantity: maximumNumberColumns - this.HeaderRow.getNumberColumns()
        });

        this.FirstRow = this.seed({
            row: this.FirstRow,
            seedValue: 'cell not found',
            seedQuantity: maximumNumberColumns - this.FirstRow.getNumberColumns()
        });

        this.SecondRow = this.seed({
            row: this.SecondRow,
            seedValue: 'cell not found',
            seedQuantity: maximumNumberColumns - this.SecondRow.getNumberColumns()
        });
    }

    public build() {

        this.normalizeColumns();

        if (this.FirstRow.getCellValue(0) != 'body cell not found' && this.SecondRow.getCellValue(0) != 'body cell not found') {
            this.FirstVariationRow = this.createVariationRow({
                firstColumnValue: 'Variação percentual',
                secondColumnValue: new Date().toLocaleDateString(),
                typeVariation: 'percent'
            });

            this.SecondVariationRow = this.createVariationRow({
                firstColumnValue: 'Variação em p.p.',
                secondColumnValue: new Date().toLocaleDateString(),
                typeVariation: 'point'
            });
        }

        return this.Matrix = [
            this.HeaderRow,
            this.FirstRow,
            this.SecondRow,
            this.FirstVariationRow,
            this.SecondVariationRow
        ];
    }
}

export class Row {

    public Cells: Cell[] = [];

    public getCellValue(indexCell: number) {
        if (this.Cells[indexCell].value) return this.Cells[indexCell].value;
        else return 'cell not found'

    }

    public addNewCell(cell: Cell) {
        this.Cells[this.Cells.length] = cell;
    }

    public getNumberColumns(): number {
        return this.Cells.length;
    }
}

export class Cell {
    constructor(public value: string | number) { }
}