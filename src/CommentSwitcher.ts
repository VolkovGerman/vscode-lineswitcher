import * as vscode from 'vscode';

class LineItem {
    data: string;
    line: number;
    isCommented: boolean;

    constructor(line, data, isCommented) {
        this.data = data;
        this.line = line;
        this.isCommented = isCommented;
    }
}

export default class CommentSwitcher {
    private config: vscode.WorkspaceConfiguration;
    private pathToFile: string;
    private matchLineRule: string;
    private matchDataRule: string;
    private dataLines: LineItem[];

    constructor() {
        // configuration
        this.config = vscode.workspace.getConfiguration('switchLine');

        this.pathToFile = vscode.workspace.rootPath + this.config.get('path');
        this.matchLineRule = this.config.get('matchLineRule') + '';
        this.matchDataRule = this.config.get('matchDataRule') + '';

        this.dataLines = [];

        this.getListOfLines();
    }

    get activeData() {
        return this.dataLines.filter(_ => !_.isCommented)[0].data;
    }

    get data() {
        return this.dataLines.map(_ => _.data);
    }

    private getListOfLines() {
        vscode.workspace
            .openTextDocument(this.pathToFile)
            .then(file => {
                const content = file.getText();

                this.dataLines = content.split('\n')
                    .map((line, index) => new LineItem(index, line, !!line.match(/\/\/ /)))
                    .filter(_ => _.data.match(new RegExp(this.matchLineRule)));
                    
                this.dataLines.forEach(_ => _.data = _.data.match(new RegExp(this.matchDataRule))[0].slice(1, -1));
            });
    }

    private commentLine(line) {
        let EditorOperations = new vscode.WorkspaceEdit();
        EditorOperations.insert(vscode.Uri.file(this.pathToFile), new vscode.Position(line, 0), '// ');
        
        vscode.workspace.applyEdit(EditorOperations);
    }

    private uncommentLine(line) {
        let EditorOperations = new vscode.WorkspaceEdit();
        EditorOperations.replace(vscode.Uri.file(this.pathToFile), new vscode.Range(line, 0, line, 3), '');

        vscode.workspace.applyEdit(EditorOperations);
    }

    private saveAll() {
        vscode.workspace.saveAll();
    }

    setActiveData(searchedData: string) {
        if (this.data.indexOf(searchedData) == -1) return;

        this.commentLine(this.dataLines.filter(_ => !_.isCommented)[0].line);
        this.uncommentLine(this.dataLines.filter(_ => _.data === searchedData)[0].line);
    
        this.saveAll();
    }

}
