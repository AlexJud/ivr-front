import { Relation } from '../graph/nodes/relation';
import { NodeType, Node } from '../graph/nodes/nodes';
import { Component, Inject, Injectable } from '@angular/core';
import { GrammarService } from '../services/grammar.service';

export class ViewNode {
    id: string
    parent?: string
    type?: string
    childrenTree?: ViewNode[]
    edgeList?: Relation[]
    options?: any[]//MAKE INTERFACE OR CLASS FOR THIS
    optionTableView?: any//MAKE INTERFACE OR CLASS FOR THIS
    childrenTableView?: any//MAKE INTERFACE OR CLASS FOR THIS
    constructor(id?: string, parent?: string, type?: string) {
      this.id = id;
      this.parent = parent;
      this.type = type
    }

    // createOptions(node?: Node): any {
    //   switch(this.type) {
    //     case NodeType.ActionNode: {
    //       return [
    //         {name: "Текст для синтеза", value: node === null ? node.props.synthText: ''},
    //         {name: "Опции распознавания", value: node === null ? node.props.options: ''},
    //         {name: "Способ распознавания", value: this._grammarService.parseGrammar},
    //         {name: "Грамматика", value: this._grammarService.grammars}
    //       ]
    //     }
    //   }
    // }

  }

  export interface ViewModelOption {

  } 
  