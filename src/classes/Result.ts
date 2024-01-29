
export default class Result {
    [key: string]: any;
    _rpage_id: string;
    _rbook_id: string;
    constructor(result: any, page_id: any, book_id: any){
        for(const key in result){
            this[key] = result[key]
        }
        this._rpage_id = page_id
        this._rbook_id = book_id
    }
}