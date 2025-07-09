// Table.class.ts
import * as THREE from "three"
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js"

/**
 * HTML table rendered in 3D space via CSS2DObject.
 * No inline styles; external CSS is used for styling.
 */
export class Table extends CSS2DObject {
  private tableElement: HTMLTableElement
  private tableHeaderRow: HTMLTableRowElement | null = null
  private tableBody: HTMLTableSectionElement

  // _currentHeaders stores the string names for columns
  private _currentHeaders: string[] = []
  // _currentData now stores an array of string arrays (rows of cells)
  private _currentData: string[][] = []

  /**
   * Creates a new Table instance.
   * @param initialData Optional initial data (array of string arrays).
   * @param className Optional CSS class for the <table> element.
   */
  constructor(initialData: string[][] = [], className: string = "Table") {
    const table = document.createElement("table")
    table.className = className

    const tbody = document.createElement("tbody")
    table.appendChild(tbody)

    super(table)

    this.tableElement = table
    this.tableBody = tbody

    if (initialData.length > 0) {
      this.setTd(initialData)
    }
  }

  /**
   * Sets table headers (<thead>).
   * This defines the number and names of columns.
   * @param headers Array of header strings.
   */
  public setTh(headers: string[]): void {
    // Remove existing header row
    if (this.tableHeaderRow && this.tableHeaderRow.parentNode) {
      this.tableHeaderRow.parentNode.removeChild(this.tableHeaderRow)
      this.tableHeaderRow = null
    }

    this._currentHeaders = headers

    if (headers.length === 0) return

    // Build header HTML string
    let headerHtml = "<tr>"
    headers.forEach((headerText) => {
      headerHtml += `<th>${headerText}</th>`
    })
    headerHtml += "</tr>"

    const thead = this.tableElement.createTHead()
    thead.innerHTML = headerHtml
    this.tableHeaderRow = thead.firstElementChild as HTMLTableRowElement

    this.tableElement.prepend(thead)

    // Re-render body if data exists, to match new header order/count
    if (this._currentData.length > 0) {
      this.setTd(this._currentData) // Re-process existing data with new headers
    }
  }

  /**
   * Sets table data (<tbody>).
   * If no headers are set, generic "Column N" headers are generated.
   * @param data Array of string arrays, each representing a row.
   */
  public setTd(data: string[][]): void {
    this._currentData = data

    if (data.length === 0) {
      this.tableBody.innerHTML = ""
      return
    }

    // Derive generic headers if not explicitly set
    if (this._currentHeaders.length === 0) {
      // Find the maximum number of columns needed from the data
      let maxCols = 0
      data.forEach((row) => {
        if (row.length > maxCols) {
          maxCols = row.length
        }
      })

      const derivedHeaders: string[] = []
      for (let i = 0; i < maxCols; i++) {
        derivedHeaders.push(`Column ${i + 1}`)
      }
      this.setTh(derivedHeaders) // This will update _currentHeaders
    }

    // Build table body HTML string based on _currentHeaders
    let bodyHtml = ""
    data.forEach((rowData) => {
      bodyHtml += "<tr>"
      // Iterate using _currentHeaders length to ensure consistent column count
      this._currentHeaders.forEach((_, colIndex) => {
        const cellContent =
          rowData[colIndex] !== undefined ? rowData[colIndex] : "" // Get cell by index
        bodyHtml += `<td>${cellContent}</td>`
      })
      bodyHtml += "</tr>"
    })

    this.tableBody.innerHTML = bodyHtml
  }

  /**
   * Adds a single row of data to the table.
   * If no headers are set and this is the first row, generic "Column N" headers are generated.
   * @param rowData A string array representing the row data.
   */
  public addTd(rowData: string[]): void {
    // If no headers are set AND the table is currently empty, derive headers from this new row.
    if (this._currentHeaders.length === 0 && this._currentData.length === 0) {
      const derivedHeaders: string[] = []
      for (let i = 0; i < rowData.length; i++) {
        derivedHeaders.push(`Column ${i + 1}`)
      }
      this.setTh(derivedHeaders) // This will update _currentHeaders
    }

    // Add the new row to the internal data array
    this._currentData.push(rowData)

    // Build HTML string for the new row based on _currentHeaders
    let rowHtml = ""
    this._currentHeaders.forEach((_, colIndex) => {
      const cellContent =
        rowData[colIndex] !== undefined ? rowData[colIndex] : ""
      rowHtml += `<td>${cellContent}</td>`
    })

    // Create a new table row element and set its innerHTML
    const tr = document.createElement("tr")
    tr.innerHTML = rowHtml

    // Append the new row to the table body
    this.tableBody.appendChild(tr)
  }

  /**
   * Returns the raw HTMLTableElement.
   */
  public getTableElement(): HTMLTableElement {
    return this.tableElement
  }
}
