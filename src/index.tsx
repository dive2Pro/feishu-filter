import React from "react";
import { render } from "react-dom";

import { FocusStyleManager } from "@blueprintjs/core";

import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/datetime/lib/css/blueprint-datetime.css";
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";
import "./app.css";

FocusStyleManager.onlyShowFocusOnTabs();

import { ReactNode, SyntheticEvent, useState } from "react";
import { makeAutoObservable } from "mobx";
import { observer } from "mobx-react-lite";
import { Button, MenuItem } from "@blueprintjs/core";
import { IItemRendererProps, Select, Suggest } from "@blueprintjs/select";
import "normalize.css";

type Block = {
  title: string;
};

//TODO - 换成用函数而非比较字符串
//     比如：
/**
 * class OrConnector {
 *  calc(results: any[]) {
 *
 *  }
 * }
 */
type IConnector = "OR" | "AND";

interface IOperator<T> {
  label: string;
  filterMethod: (b: Block) => boolean;

  value: T;
  onChange: (value: T) => void;
}

interface IFilterField {
  onSelect(operator: string): void;
  label: string;
  operators: IOperator<any>[];
  activeOperator: IOperator<any>;
}

class FilterPlaceholder {
  constructor() {
    makeAutoObservable(this);
  }
  onSelect(name: string) {
    switch (name) {
      case "title":
        this.delegate = new TitleFilter();
        break;
      case "string":
        this.delegate = new StringFilter();
        break;
    }
  }
  filterOptions = [
    {
      name: "title",
      clazz: TitleFilter
    },
    {
      name: "string",
      clazz: StringFilter
    }
  ];

  delegate: null | IFilterField = null;
}

class StringFilter implements IFilterField {
  label: string = "string";
  operators: IOperator<any>[] = [
    new ContainsOperator(),
    new DoesNotContainsOperator()
  ];
  constructor() {
    makeAutoObservable(this);
  }
  activeOperator = this.operators[0];

  onSelect(operator: string) {
    this.activeOperator = this.operators.find((ope) => ope.label === operator)!;
  }
}

class TitleFilter implements IFilterField {
  label: string = "title";
  operators: IOperator<any>[] = [
    new ContainsOperator(),
    new DoesNotContainsOperator()
  ];
  activeOperator = this.operators[0];

  constructor() {
    makeAutoObservable(this);
  }

  onSelect(operator: string) {
    this.activeOperator = this.operators.find((ope) => ope.label === operator)!;
  }
}

class DoesNotContainsOperator implements IOperator<string> {
  label = "does not contains";

  constructor() {
    makeAutoObservable(this);
  }
  filterMethod = (b: Block) => {
    return b.title.includes(this.value!);
  };

  value = "";

  onChange = (v: string) => {
    this.value = v;
  };
}

class ContainsOperator implements IOperator<string> {
  label = "contains";

  constructor() {
    makeAutoObservable(this);
  }
  filterMethod = (b: Block) => {
    return b.title.includes(this.value!);
  };

  value = "";

  onChange = (v: string) => {
    this.value = v;
  };
}

class FilterGroup {
  label: string = "group";
  creating = true;
  filters: FilterPlaceholder[] = [];
  groups: FilterGroup[] = [];
  connector: IConnector = "AND";

  constructor() {
    makeAutoObservable(this);
    this.addNewFilter();
  }

  addNewFilter() {
    this.filters.push(new FilterPlaceholder());
  }

  addNewGroup(group: FilterGroup) {
    this.groups.push(group);
  }
}

class SearchInlineModel {
  group = null as null | FilterGroup;
  constructor() {
    makeAutoObservable(this);
  }

  addFilterCondition() {
    if (!this.group) {
      this.group = new FilterGroup();
    }
  }
}

const SearchInline = observer(() => {
  const model = useState(() => new SearchInlineModel())[0];
  console.log("render -- ");
  return (
    <div>
      <section>
        {model.group ? <SearchGroup group={model.group} /> : null}
      </section>
      <Button
        onClick={() => {
          model.addFilterCondition();
        }}
      >
        Add filter condition
      </Button>
    </div>
  );
});
const OperatorsSelect = observer(
  (props: {
    onSelect: (label: string) => void;
    items: { label: string }[];
    activeItem: { label: string };
  }) => {
    console.log(props.activeItem, " =active");
    return (
      <Select
        items={props.items}
        itemsEqual={function (a, b) {
          return a.label === b.label;
        }}
        inputProps={{
          disabled: true
        }}
        itemRenderer={function (
          item,
          { modifiers, handleClick }: IItemRendererProps
        ) {
          console.log(item, " operator");
          return (
            <MenuItem
              {...{
                active: modifiers.active,
                disabled: modifiers.disabled,
                key: item.label,
                // label: film.year.toString(),
                onClick: handleClick,
                // onFocus: handleFocus,
                // ref,
                text: item.label
              }}
              text={item.label}
            ></MenuItem>
          );
        }}
        onItemSelect={function (
          item,
          event?: SyntheticEvent<HTMLElement, Event> | undefined
        ) {
          props.onSelect(item.label);
        }}
      >
        <Button
          text={props.activeItem.label}
          rightIcon="double-caret-vertical"
        />
      </Select>
    );
  }
);
const FieldsSelect = (props: {
  onSelect: (name: string) => void;
  items: { name: string }[];
}) => {
  return (
    <Suggest
      items={props.items}
      itemsEqual={function (a, b) {
        return a.name === b.name;
      }}
      inputValueRenderer={function (item) {
        return item.name;
      }}
      itemPredicate={(query, item, index) => {
        return item.name.indexOf(query) >= 0;
      }}
      itemRenderer={function (
        item,
        { modifiers, handleClick }: IItemRendererProps
      ) {
        console.log(item, " = item");
        return (
          <MenuItem
            {...{
              active: modifiers.active,
              disabled: modifiers.disabled,
              key: item.name,
              // label: film.year.toString(),
              onClick: handleClick,
              // onFocus: handleFocus,
              // ref,
              text: item.name
            }}
            text={item.name}
          ></MenuItem>
        );
      }}
      onItemSelect={function (
        item,
        event?: SyntheticEvent<HTMLElement, Event> | undefined
      ) {
        props.onSelect(item.name);
      }}
    />
  );
};

const SearchGroup = observer((props: { group: FilterGroup }) => {
  console.log(props, " = props");
  return (
    <div>
      {props.group.filters.map((f, i) => {
        return (
          <div key={i} className="flex">
            <FieldsSelect
              items={f.filterOptions}
              onSelect={(name) => {
                f.onSelect(name);
              }}
            ></FieldsSelect>
            {f.delegate ? (
              <div>
                <OperatorsSelect
                  items={f.delegate.operators}
                  onSelect={(operator) => {
                    f.delegate!.onSelect(operator);
                  }}
                  activeItem={f.delegate.activeOperator}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
});

const App = () => (
  <div>
    <SearchInline />
  </div>
);

render(<App />, document.getElementById("root"));
