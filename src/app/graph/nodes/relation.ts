export class Relation {
    id: string;
    match: string[];
    constructor(id: string, match?: string[]) {
        this.id = id;
        this.match = match;
    }
}