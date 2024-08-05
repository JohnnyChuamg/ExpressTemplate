class Policyholder {
    id;
    name;
    createDate;
    pid
    constructor(id, name, createDate, pid) {

    }
}

class PolicyholderBinaryTree {
    root;

    constructor() {
        this.root = null;
    }

    insert(id, name, createDate, pid) {
        if (!this.root) {
            this.root = new Policyholder(id, name, createDate, pid)
            return
        }

        let queue = [this.root];
        while (queue.length > 0) {
            let currentNode = queue.shift();
            if (!currentNode.left) {
                currentNode.left = new Policyholder(id, name, createDate, pid)
                return
            } else {
                queue.push(currentNode.left);
            }

            if (!currentNode.right) {
                currentNode.right = new Policyholder(id, name, createDate, pid);
                return
            } else {
                queue.push(currentNode.right)
            }
        }
    }

    #inorder(node, array, option) {
        if (node) {
            array.push({...node, level: option.level, type: option.type});
            option.level += 1;
            this.#inorder(node.left, array, {level: option.level, type: 'l'});
            this.#inorder(node.right, array, {level: option.level, type: 'r'});
        }
    }

    #getLeftTree() {
        let result = [];
        if (this.root && this.root.left) {
            this.#inorder(this.root.left, result, {level: 1, type: 'l'})
        }
        return result;
    }

    #getRightTree() {
        let result = [];
        if (this.root && this.root.rigth) {
            this.#inorder(this.root.right, result, {level: 1, type: 'r'})
        }
        return result
    }
}