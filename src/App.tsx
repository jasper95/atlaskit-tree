import './node.css' 
import React, { useState } from 'react';
import styled from 'styled-components';
import Tree, {
  mutateTree,
  RenderItemParams,
  TreeItem,
  ItemId,
  TreeSourcePosition,
  TreeDestinationPosition,
} from '@atlaskit/tree';
import { iRawNode } from './types';
import { convertTree } from './utils';
import classnames from 'clsx'


const PADDING_PER_LEVEL = 44;

const PreTextIcon = styled.span`
  display: inline-block;
  width: 16px;
  justify-content: center;
  cursor: pointer;
`;


const getIcon = (
  item: TreeItem,
  onExpand: (itemId: ItemId) => void,
  onCollapse: (itemId: ItemId) => void,
) => {
  if (item.children && item.children.length > 0) {
    return item.isExpanded ? (
      <PreTextIcon onClick={() => onCollapse(item.id)}>-</PreTextIcon>
    ) : (
      <PreTextIcon onClick={() => onExpand(item.id)}>+</PreTextIcon>
    );
  }
  return <PreTextIcon>&bull;</PreTextIcon>;
};

const rawData: iRawNode[] = [
  {
    id: 1,
    order: 1,
    level: 1,
    parentId: 0
  },
  {
    id: 2,
    order: 2,
    level: 1,
    parentId: 0
  },
  {
    id: 3,
    order: 3,
    level: 1,
    parentId: 0
  },
  {
    id: 4,
    parentId: 3,
    order: 1,
    level: 2
  },
  {
    id: 5,
    parentId: 1,
    order: 1,
    level: 2
  },
  {
    id: 6,
    parentId: 1,
    order: 1,
    level: 2
  },
  {
    id: 7,
    parentId: 2,
    order: 1,
    level: 2
  },
  {
    id: 8,
    parentId: 2,
    order: 2,
    level: 2
  },
  {
    id: 9,
    parentId: 3,
    order: 2,
    level: 2
  },
  {
    id: 10,
    parentId: 4,
    order: 1,
    level: 3
  }
];

export default function PureTree() {
  const [data, setData] = useState(rawData)
  const [tree, setTree] = useState(initialTree)

  return (
    <Tree
      tree={tree}
      renderItem={renderItem}
      onExpand={expandHandler}
      onCollapse={collapseHandler}
      onDragEnd={onDragEnd}
      offsetPerLevel={PADDING_PER_LEVEL}
      isDragEnabled
      isNestingEnabled
    />
  )

  function initialTree() {
    return convertTree(data)
  }

  function renderItem(params: RenderItemParams) {
    const { item, onExpand, onCollapse, provided } = params
    const lowerSiblingsCount: number[] = item.data?.lowerSiblingsCount ?? []
    const siblingsLength = lowerSiblingsCount.length
    return (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
        >
          <div style={{ padding: '10px', position: 'relative', display: 'flex', alignItems: 'center'}}>
              {lowerSiblingsCount.map((lowerSiblingCount, i) => {
                let lineClass = "";
                if (params.depth > 0) {
                  if (lowerSiblingCount > 0) {
                    // At this level in the tree, the nodes had sibling nodes further down
            
                    if (item?.data.id === 1) {
                      // Top-left corner of the tree
                      // +-----+
                      // |     |
                      // |  +--+
                      // |  |  |
                      // +--+--+
                      lineClass =
                        "rst__lineHalfHorizontalRight rst__lineHalfVerticalBottom";
                    } else if (i === siblingsLength - 1) {
                      // Last scaffold block in the row, right before the row content
                      // +--+--+
                      // |  |  |
                      // |  +--+
                      // |  |  |
                      // +--+--+
                      lineClass = "rst__lineHalfHorizontalRight rst__lineFullVertical";
                    } else if (i > 0) {
                      // Simply connecting the line extending down to the next sibling on this level
                      // +--+--+
                      // |  |  |
                      // |  |  |
                      // |  |  |
                      // +--+--+
                      lineClass = "rst__lineFullVertical";
                    }
                  } else if (false) {
                    // Top-left corner of the tree, but has no siblings
                    // +-----+
                    // |     |
                    // |  +--+
                    // |     |
                    // +-----+
                    lineClass = "rst__lineHalfHorizontalRight";
                  } else if (i === siblingsLength - 1) {
                    // The last or only node in this level of the tree
                    // +--+--+
                    // |  |  |
                    // |  +--+
                    // |     |
                    // +-----+
                    lineClass = "rst__lineHalfVerticalTop rst__lineHalfHorizontalRight";
                  }
                }
                return (
                  <div key={i} className={classnames('rst__lineBlock', lineClass)} style={{ position: 'absolute', left: `-${((PADDING_PER_LEVEL) * (siblingsLength-i))}px`, width: PADDING_PER_LEVEL }}></div>  
                )
              }
              )}
            <div {...provided.dragHandleProps} style={{marginRight: 5}}>handle</div>
            <span>{item.data ? item.data.title : ''}</span>
            <span>{getIcon(item, onExpand, onCollapse)}</span>
          </div>
        </div>
    );
  }


  function expandHandler(itemId: ItemId) {
    setTree(tree => mutateTree(tree, itemId, { isExpanded: true }))
  };

  function collapseHandler(itemId: ItemId){
    setTree(tree => mutateTree(tree, itemId, { isExpanded: false }))
  };


  function onDragEnd(
    source: TreeSourcePosition,
    destination?: TreeDestinationPosition,
  ){
    if (!destination) {
      return;
    }
    let oldSiblings = data.filter((e) => e.parentId === source.parentId)
    const selected = oldSiblings.find((e) => e.order === (source?.index ?? 0) + 1)
    
    const newSiblings = data.filter((e) => e.parentId === destination.parentId && e.id !== selected?.id)
    const updateNodes = newSiblings
    .map((e, i) => {
      return {
        ...e,
        order: i  >= (destination?.index ?? 0) ? i + 2 : i + 1
      }
    })

    if(source.parentId !== destination.parentId) {
      oldSiblings = oldSiblings
        .filter(e => e.id !== selected?.id)
        .map((e, i) => ({
          ...e,
          order: i + 1
        }))
      updateNodes.push(...oldSiblings)
    }

    if(selected) {
      updateNodes.push({
        ...selected,
        parentId: Number(destination?.parentId),
        order: (destination?.index ?? 0) + 1,
      })
    }
    const updatedLookUp: {[key in number]: iRawNode} = updateNodes.reduce((acc, el) => {
      return {
        ...acc,
        [el.id]: el
      }
    }, {})
    const newData = data.map(e => updatedLookUp[e.id] ? updatedLookUp[e.id] : e)
    setData(newData)
    setTree(convertTree(newData))
  }
}