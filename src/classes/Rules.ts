import { RulesType } from "../types";

export default class Rules {
    rules: RulesType;
    constructor(rules: RulesType) {
        this.rules = rules;
    }
    validate(data: any, acceptForeignKeys: boolean = true) {
        let success = false;
        let message = "";
        let result = {
            success,
            message
        }
        // validate the values of the data object to see if its the same type as the rules.
        // first step loop through keys of the data object
        let rules_keys = Object.keys(this.rules);
        let data_keys = Object.keys(data);
        for (const key of rules_keys) {
            if (!data_keys.includes(key)) {
                result.success = false;
                result.message = `Key '${key}' is missing from the data object`;
                return result;
            }
        }
        for (const key in data) {
            
            // second step check if the key exists in the rules object
            if (this.rules[key]) {
                // third step check if the value of the key is the same type as the rules value
                if (typeof data[key] !== this.rules[key]) {
                    // if not return false
                    result.success = false;
                    result.message = `Key '${key}' is not a ${this.rules[key]}. Received type: '${typeof data[key]}'`;
                    return result;
                }
            } else {
                // if not return false
               if(!acceptForeignKeys){
                result.success = false;
                result.message = `Key '${key}' is not defined in rules.`;
                return result;
               }
            }

        }
        // if all the keys and values are the same type as the rules return true
        result.success = true;
        return result;
    }

}