import { zModule, zModuleType } from "@zodyac/core";

interface zTreeNode {
  name: string;
  token: symbol;
  weight: number;
  children: symbol[];
  requires: symbol[];
}

type zNodeCatalogue = Map<symbol, zTreeNode>;
interface zTree {
  catalogue: zNodeCatalogue;
  root: zTreeNode;
}

export function createDependencyTree<T extends zModule>(
  source: zModuleType<T>,
): zTree {
  const catalogue: zNodeCatalogue = new Map();
  const root = parseNode(source, catalogue);
  return { catalogue, root };
}

export function parseNode<T extends zModule>(
  source: zModuleType<T>,
  catalogue?: zNodeCatalogue,
) {
  const module = source.prototype;
  if (module.__token == undefined) throw new Error("Module is not decorated");
  if (module.__weight == undefined) throw new Error("Module is not decorated");

  const node: zTreeNode = {
    name: source.name,
    token: module.__token,
    weight: module.__weight,
    children: [],
    requires: [],
  };

  for (const child of module.__providers!.keys()) {
    const child_node = parseNode(child, catalogue);
    node.children.push(child_node.token);
  }

  for (const target of module.__requires!) {
    node.requires.push(target.from.prototype.__token!);
  }

  catalogue?.set(node.token, node);
  return node;
}
