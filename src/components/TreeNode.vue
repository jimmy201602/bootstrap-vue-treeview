<template>
    <div class="tree-branch"
         :class="{ selected: selected }">
        <div class="tree-node"
             :class="{ 'has-child-nodes': hasChildren, 'tree-node-expanded': expanded, 'drop-active': nodeDragOver }"
             @drop.prevent="drop"
             @dragover.prevent="dragover"
             :draggable="draggable && !renaming"
             @dragstart.stop="dragstart"
             @dragend="dragend"
             @dragenter.prevent.stop="dragEnter"
             @dragleave.prevent.stop="dragLeave"
             @contextmenu="showContextMenu($event)">
            <transition name="rotateArrow">
                <svg width="12"
                     height="12"
                     @click.prevent="toggle"
                     class="tree-node-icon"
                     viewBox="0 0 438.536 438.536"
                     style="enable-background:new 0 0 438.536 438.536;"
                     xml:space="preserve"
                     v-if="hasChildren">
                    <g>
                        <path d="M414.41,24.123C398.333,8.042,378.963,0,356.315,0H82.228C59.58,0,40.21,8.042,24.126,24.123
                            C8.045,40.207,0.003,59.576,0.003,82.225v274.084c0,22.647,8.042,42.018,24.123,58.102c16.084,16.084,35.454,24.126,58.102,24.126
                            h274.084c22.648,0,42.018-8.042,58.095-24.126c16.084-16.084,24.126-35.454,24.126-58.102V82.225
                            C438.532,59.576,430.49,40.204,414.41,24.123z M365.449,237.539c0,4.948-1.811,9.236-5.421,12.847
                            c-3.621,3.614-7.905,5.428-12.854,5.428H255.82v91.358c0,4.948-1.817,9.232-5.432,12.847c-3.61,3.62-7.897,5.427-12.847,5.427
                            h-36.543c-4.948,0-9.231-1.807-12.847-5.427c-3.617-3.614-5.426-7.898-5.426-12.847v-91.358H91.363
                            c-4.948,0-9.229-1.813-12.847-5.428c-3.615-3.61-5.424-7.898-5.424-12.847v-36.547c0-4.948,1.809-9.231,5.424-12.847
                            c3.617-3.617,7.898-5.426,12.847-5.426h91.363V91.36c0-4.949,1.809-9.233,5.426-12.847c3.616-3.618,7.898-5.428,12.847-5.428
                            h36.543c4.949,0,9.236,1.81,12.847,5.428c3.614,3.614,5.432,7.898,5.432,12.847v91.36h91.354c4.948,0,9.232,1.809,12.854,5.426
                            c3.613,3.615,5.421,7.898,5.421,12.847V237.539z"/>
                    </g>
                    <g></g>
                    <g></g>
                    <g></g>
                    <g></g>
                    <g></g>
                    <g></g>
                    <g></g>
                    <g></g>
                    <g></g>
                    <g></g>
                    <g></g>
                    <g></g>
                    <g></g>
                    <g></g>
                    <g></g>
                </svg>
            </transition>
            <span class="tree-node-label"
                  @click="toggleSelection"
                  @dblclick="dblClickLabel">
                <i :class="['label-icon', prependIconClass, iconClass]" v-if="showIcon && iconClass !== null"></i>
                <input class="form-control form-control-sm input-rename"
                       ref="inputRename"
                       type="text"
                       v-model="renameNewLabel"
                       v-if="renaming"
                       v-focus
                       v-select-text
                       @blur="endRenaming"
                       v-on:keyup.esc.stop="cancelRenaming"
                       v-on:keyup.enter.stop="endRenaming">
                <span v-else>{{ data[labelProp] }}</span>
            </span>
        </div>
        <div class="tree-node-children"
             v-show="expanded && data[childrenProp] && Array.isArray(data[childrenProp])">
            <drop-between-zone @nodeDrop="dropNodeAtPosition(0)"
                               v-if="!dropDisabled && draggedNode !== null && data[childrenProp] && draggedNode.data !== data[childrenProp][0]">
            </drop-between-zone>
            <template v-for="(nodeData, index) in data[childrenProp]">
                <tree-node
                        :data="nodeData"
                        :key="nodeData[keyProp]"
                        ref="childNodes"
                        :keyProp="keyProp"
                        :labelProp="labelProp"
                        :childrenProp="childrenProp"
                        :renameOnDblClick="renameOnDblClick"
                        :draggable="draggable"
                        :defaultIconClass="defaultIconClass"
                        :iconClassProp="iconClassProp"
                        :showIcon="showIcon"
                        :prependIconClass="prependIconClass"
                        :contextMenu="contextMenu"
                        @nodeSelect="childNodeSelect"
                        @nodeDragStart="nodeDragStart"
                        @deleteNode="deleteChildNode">
                </tree-node>
                <drop-between-zone
                        @nodeDrop="dropNodeAtPosition(index + 1)"
                        v-if="!dropDisabled && draggedNode && draggedNode.data !== nodeData && (index + 1 >= data[childrenProp].length || draggedNode.data !== data[childrenProp][index + 1])">
                </drop-between-zone>
            </template>
        </div>
    </div>
</template>

<script>
    import EventBus from '../EventBus';
    import DropBetweenZone from './DropBetweenZone.vue';

    export default {
        name: 'tree-node',
        components: {
            DropBetweenZone
        },
        props: {
            data: {
                type: Object,
                required: true
            },
            keyProp: {
                type: String,
                default: 'id'
            },
            labelProp: {
                type: String,
                default: 'name'
            },
            childrenProp: {
                type: String,
                default: 'children'
            },
            draggable: {
                type: Boolean,
                default: false
            },
            renameOnDblClick: {
                type: Boolean,
                default: false
            },
            // default icon if node icon is not specified
            defaultIconClass: {
                type: String,
                default: null
            },
            // where to search for node icon
            iconClassProp: {
                type: String,
                default: null
            },
            // show icon
            showIcon: {
                type: Boolean,
                default: false
            },
            // class added to every icon no matter what
            prependIconClass: {
                type: String,
                default: null
            },
            contextMenu: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                expanded: false,
                selected: false,
                nodeDragOver: false,
                enterLeaveCounter: 0,
                draggedNode: null,
                dropDisabled: false,
                renaming: false,
                renameNewLabel: this.data[this.labelProp]
            }
        },
        directives: {
            focus: {
                // directive definition
                inserted(el) {
                    el.focus()
                }
            },
            selectText: {
                inserted(el) {
                    el.select()
                }
            }
        },
        watch: {
            selected(selected) {
                this.$emit('nodeSelect', this, selected)
            },
            dropDisabled(disabled) {
                this.$emit(disabled ? 'dropDisabled' : 'dropEnabled')
            },
            nodeDragOver(dragover) {
                if (dragover) {
                    // check if node has any children, if yes then expand it after 1 sec
                    if (!this.expanded && Array.isArray(this.data[this.childrenProp]) && this.data[this.childrenProp].length > 0) {
                        this.expandNodeTimeout = setTimeout(this.toggle, 1000)
                    }
                } else if (this.expandNodeTimeout) {
                    clearTimeout(this.expandNodeTimeout)
                }
            }
        },
        computed: {
            hasChildren() {
                return this.data[this.childrenProp] !== undefined && this.data[this.childrenProp].length > 0
            },
            iconClass() {
                return this.iconClassProp && this.data[this.iconClassProp] !== undefined
                    ? this.data[this.iconClassProp] : this.defaultIconClass;
            }
        },
        methods: {
            toggle() {
                if (this.data[this.childrenProp] && Array.isArray(this.data[this.childrenProp]) && this.data[this.childrenProp].length > 0) {
                    this.expanded = !this.expanded
                }
            },
            toggleSelection() {
                if (!this.renaming) {
                    this.selected = !this.selected
                }
            },
            select() {
                if (!this.renaming) {
                    this.selected = true
                }
            },
            deselect() {
                if (!this.renaming) {
                    this.selected = false
                }
            },
            expand() {
                if (this.data[this.childrenProp] && Array.isArray(this.data[this.childrenProp]) && this.data[this.childrenProp].length > 0) {
                    this.expanded = true
                }
            },
            collapse() {
                this.expanded = false
            },
            childNodeSelect(node, isSelected) {
                // forward event to the parent node
                this.$emit('nodeSelect', node, isSelected)
            },
            nodeDragStart() {
                EventBus.$on('dropOK', this.cutNode)
            },
            cutNode() {
                EventBus.$off('dropOK')
                let idx = this.data[this.childrenProp].indexOf(window._bTreeView.draggedNodeData)
                this.data[this.childrenProp].splice(idx, 1)
                // let's notify that node data was successfully cut (removed from array)
                EventBus.$emit('cutOK')
            },
            getChildNodes() {
                return this.$refs.childNodes || []
            },
            dragstart(ev) {
                this.dropDisabled = true
                ev.dataTransfer.dropEffect = 'none'
                this.$emit('nodeDragStart')
                EventBus.$emit('nodeDragStart', this)
                // didn't use dataTransfer it's not fully supported by ie
                // and beacuse it's not available in the dragover event handler
                if (window._bTreeView === undefined) {
                    window._bTreeView = {}
                }
                _bTreeView.draggedNodeData = this.data
                _bTreeView.draggedNodeKey = this.data[this.keyProp]
            },
            drop(ev) {
                if (this.data[this.childrenProp] === undefined) {
                    Vue.set(this.data, this.childrenProp, [])
                }
                // append node
                this.dropNodeAtPosition(this.data[this.childrenProp].length)
                this.nodeDragOver = false
            },
            dragEnter(ev) {
                this.enterLeaveCounter++
                this.dropEffect = ev.dataTransfer.dropEffect = !this.dropDisabled
                && window._bTreeView !== undefined && window._bTreeView.draggedNodeKey !== undefined
                && this.data[this.keyProp] !== window._bTreeView.draggedNodeKey
                && (this.data[this.childrenProp] === undefined
                    || this.data[this.childrenProp].indexOf(window._bTreeView.draggedNodeData) < 0)
                && !this.isDescendantOf(window._bTreeView.draggedNodeData)
                    ? 'move' : 'none'
                if (this.dropEffect === 'move' && this.enterLeaveCounter === 1) {
                    this.nodeDragOver = true
                }
            },
            dragLeave() {
                this.enterLeaveCounter--
                if (this.enterLeaveCounter !== 1) {
                    this.nodeDragOver = false
                }
            },
            dragend(ev) {
                EventBus.$off('dropOK')
                EventBus.$off('cutOK')
                this.dropDisabled = false
                EventBus.$emit('nodeDragEnd')
            },
            dragover(ev) {
                ev.dataTransfer.dropEffect = this.dropEffect || 'none'
            },
            isDescendantOf(nodeData) {
                if (nodeData[this.childrenProp] === undefined) {
                    return false
                }
                let nodes = [
                    nodeData
                ]
                for (let i = 0; i < nodes.length; i++) {
                    let tmpNode = nodes[i]
                    if (tmpNode[this.childrenProp] !== undefined) {
                        for (let child of tmpNode[this.childrenProp]) {
                            if (child === this.data) {
                                return true
                            }
                        }
                        nodes.push(...tmpNode[this.childrenProp])
                    }
                }
            },
            draggingStarted(draggedNode) {
                this.draggedNode = draggedNode
                this.enterLeaveCounter = 0
                // let's listen for the drag end event
                EventBus.$on('nodeDragEnd', this.draggingEnded)
            },
            draggingEnded() {
                // stop listening for the dragging end event
                EventBus.$off('nodeDragEnd', this.draggingEnded)
                this.draggedNode = null
            },
            dropNodeAtPosition(pos) {
                // position can change if we move node within the same parent node (same level)
                // so it's better to remember node at previous position
                let insertAfter = pos - 1 < 0 ? null : this.data[this.childrenProp][pos - 1]
                EventBus.$on('cutOK', () => {
                    let pos = this.data[this.childrenProp].indexOf(insertAfter) + 1
                    this.data[this.childrenProp].splice(pos, 0, window._bTreeView.draggedNodeData)
                    delete window._bTreeView.draggedNodeKey
                    delete window._bTreeView.draggedNodeData
                    EventBus.$off('cutOK')
                })
                EventBus.$emit('dropOK')
            },
            showContextMenu(event) {
                if (this.renaming) {
                    this.cancelRenaming()
                }
                this.select()
                if(this.contextMenu) {
                    event.preventDefault();
                    EventBus.$emit('openNodeContextMenu', this)
                }
            },
            delete() {
                this.$emit('deleteNode', this)
            },
            deleteChildNode(childNodeData) {
                let children = this.data[this.childrenProp]
                let idx = children.indexOf(childNodeData)
                children.splice(idx, 1)
            },
            appendChild(childNodeData) {
                if (this.data[this.childrenProp] === undefined) {
                    Vue.set(this.data, this.childrenProp, [])
                }
                this.data[this.childrenProp].push(childNodeData)
                this.expanded = true
            },
            startRenaming() {
                this.deselect();
                this.renameNewLabel = this.data[this.labelProp]
                this.renaming = true
            },
            cancelRenaming() {
                this.renameNewLabel = this.data[this.labelProp]
                this.renaming = false
            },
            endRenaming() {
                this.data[this.labelProp] = this.renameNewLabel
                this.renaming = false
            },
            dblClickLabel() {
                if (this.renameOnDblClick) {
                    this.startRenaming();
                }
            }
        },
        created() {
            EventBus.$on('nodeDragStart', this.draggingStarted)
            this.$watch(`data.${this.childrenProp}`, function (children) {
                if (children.length === 0 && this.expanded) {
                    this.expanded = false
                }
            })
            if (this.$parent) {
                this.$parent.$on('dropDisabled', () => {
                    this.dropDisabled = true
                })
                this.$parent.$on('dropEnabled', () => {
                    this.dropDisabled = false
                })
            }
        }
    }

</script>

<style>
    .tree-node-label {
        cursor: pointer;
        padding: 2px 4px;
        border-radius: 3px;
        -ms-user-select: none;
        user-select: none;
    }

    .tree-node-label:hover {
        background-color: #EBECEE;
    }

    .tree-node-icon {
        color: #464646;
        transition: transform 0.3s;
    }

    .tree-node {
        margin-left: 16px;
    }

    .tree-node.has-child-nodes {
        margin-left: 0;
    }

    .tree-node.has-child-nodes .tree-node-icon {
        cursor: pointer;
    }

    .tree-node-expanded .tree-node-icon path {
        /*transform: rotate(90deg);*/
        /*transition: transform 0.3s;*/
        d: path('m453.332031 0h-394.664062c-32.363281 0-58.667969 26.304688-58.667969 58.667969v394.664062c0 32.363281 26.304688 58.667969 58.667969 58.667969h394.664062c32.363281 0 58.667969-26.304688 58.667969-58.667969v-394.664062c0-32.363281-26.304688-58.667969-58.667969-58.667969zm-85.332031 277.332031h-224c-11.796875 0-21.332031-9.554687-21.332031-21.332031s9.535156-21.332031 21.332031-21.332031h224c11.796875 0 21.332031 9.554687 21.332031 21.332031s-9.535156 21.332031-21.332031 21.332031zm0 0') !important;
    }

    .tree-node-children {
        margin-left: 22px;
    }

    .tree-branch {
        position: relative;
    }

    .tree-branch.selected > .tree-node > .tree-node-label {
        background-color: #007bff;
        color: #fff;
    }

    .tree-node.drop-active {
        border: 1px dashed #D2D2D2;
    }

    .tree-node-label .label-icon {
        font-size: 90%;
    }

    .tree-node > svg {
        display: inline-block;
        -ms-user-select: none;
        user-select: none;
    }

    .tree-node .input-rename {
        display: inline-block;
        width: auto;
        font-weight: 400;
        line-height: 1;
        font-size: 1rem;
        padding: 2px 4px;
        height: auto;
        box-sizing: border-box;
    }

    .tree-node svg > .svg-icon {
        fill: none;
        opacity: 1;
        stroke: currentColor;
        stroke-width: 1.5;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-miterlimit: 4;
        stroke-dasharray: none;
        stroke-opacity: 1
    }

    .tree-node.tree-node-expanded > svg > .svg-icon {
        fill: none;
    }
</style>
