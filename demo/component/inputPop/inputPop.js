/**
 * 弹框输入组件
 */
import BaseCom from '../../lib/com/baseCom.js'
class InputPop extends BaseCom {
	// 便于扩展
	constructor(options = {}) {
		super(...arguments);
		this.addFunc('bindDel',    this.bindDel);
		this.addFunc('bindOk',     this.bindOk);
		this.addFunc('bindCancel', this.bindCancel);
		this.addFunc('bindinput',  this.bindinput);
	}
	bindinput(e){
		this._data.value = e.detail.value;
		this.setMyData("value",this._data.value);
	}
	bindDel(e){
		this.setMyData("value","");
	}
	
	bindOk(e){
		this.options.bind["bindOk"].call(this.page,this._data.value);
	}
	
	bindCancel(e){
		this.setHidden();
	}
	getValue(){
        return this._data.value;
    }
}
export default InputPop