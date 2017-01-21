'use strict';

import * as vscode from 'vscode';

import CommentSwitcher from './CommentSwitcher';

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('extension.switchLine', () => {

        let commentSwitcher: CommentSwitcher = new CommentSwitcher();

        commentSwitcher.getListOfLines().then(() => {
            vscode.window.showQuickPick(commentSwitcher.data)
                .then(choosedData => {
                    vscode.window.showInformationMessage('Switched To: ' + choosedData);

                    commentSwitcher.setActiveData(choosedData);
                });
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}
