import { ItemId, TreeData, TreeItem } from "@atlaskit/tree";
import { iRawNode } from "./types";

function sortByOrder(a: iRawNode, b: iRawNode) {
  return a.order - b.order
}
export function convertTree(nodes: iRawNode[]): TreeData {
  const rootNodes = nodes.filter(e => !e.parentId);
  rootNodes.sort(sortByOrder)
  const rootNodesId = rootNodes.map(e => e.id)
  const items:  Record<ItemId, TreeItem> = nodes.map(node => {
    const childrenNodes = nodes.filter(e => e.parentId === node.id)
    childrenNodes.sort(sortByOrder)
    const children = childrenNodes.map(e => e.id)
    console.log('node.id', node.id, childrenNodes)
    return {
      id: node.id,
      children,
      hasChildren: children.length > 0,
      isExpanded: true,
      isChildrenLoading: false,
      test: false,
      data: {
        id: node.id,
        title: `Node ${node.id}`
      }
    }
  }).reduce((acc, el) => {
    return {
      ...acc,
      [`${el.id}`]: el
    }
  }, {
    '0': {
      id: 0,
      children: rootNodesId,
      hasChildren: rootNodesId.length > 0,
      // isExpanded: true,
      // isChildrenLoading: false,
      data: {
        id: 0,
      }
    }
  })

  function updateLowerSiblingsCount(id: ItemId, lowerSiblingsCounts: number[]) {
    items[`${id}`].data.lowerSiblingsCount = lowerSiblingsCounts
    items[`${id}`].children.forEach((id, idx, arr) => updateLowerSiblingsCount(id, [...lowerSiblingsCounts, (arr.length - 1) - idx]))
  }
  items['0'].children.forEach((id, idx, arr) => updateLowerSiblingsCount(id, [(arr.length - 1) - idx]))
  return {
    items,
    rootId: '0'
  }
}
