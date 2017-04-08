Modal = {
		
	getPage : function(name, pageArgs) {
		pageArgs.name = name + 'Modal';
		console.log(pageArgs);
		return `
			<div class='hidden modal' id='${pageArgs.name}'>
				<div class='modalWindow'>
					${H.page(pageArgs)}
				</div>
			</div>
		`;
	},
	
	byName : function(name) {
		return $(`#${name}Modal.modal`).data('modalObject');
	},
	
	display : function(doDisplay=true) {
		if (doDisplay) {
			$(this.container).removeClass(`hidden`);
		} else {
			$(this.container).addClass(`hidden`);
		}
	},
	
	create : function(name, newArgs) {
		const modal = Object.create(this);

		// Set modal's properties
		modal.name = name;
		modal.container = `#${name}Modal`;
		modal.page      = `#${name}ModalPage`;
		modal.header    = `#${name}ModalPageHeader`;
		modal.title     = `#${name}ModalPageTitle`;
		modal.content   = `#${name}ModalPageContent`;
		
		if (!newArgs) newArgs = {};
		
		// Add the hidden modal object to the page
		const pageArgs = $.extend({
			name : name,
			cls : "small",
			canExit : true,
		}, newArgs);
		
		$('body').append(modal.getPage(name, pageArgs));
		
		// Add the modal object to fields that can receive html
		$(modal.container).data(`modalObject`, modal);
		
		return modal;
	},
	
	destroy : function() {
		$(this.container).remove();
	}
	
};

Modals = {
	
		
	/* Args:
	 * .question      String pertaining  to question
	 * .title         String pertaining to title
	 * .yesFunc       Function that runs when yes is clicked
	 * .noFunc        Function that runs when no is clicked
	 */
		
	confirmation(args) {
		const question = args.question || 'Are you sure?';
		const title = args.title || 'Confirmation';
		const yesFunc = args.yesFunc;
		const noFunc = args.noFunc;
		const content = `
			<div class='boldText'>${question}</div>
			<div class='buttons'>
				${H.btn('Yes', 'YesBtn', cls='big', null)}
				${H.btn('No ', 'NoBtn',  cls='big', null)}
			</div>
		`;
		
		const modal = Modal.create('confirm', {cls:'tiny'});
		
		$(modal.content).html(content);
		
		$(`[name='YesBtn']`).focus();
		
		$(modal.title).html(title);
		
		$(modal.content).on('click', '[name="YesBtn"]', function(event) {
		    event.stopPropagation();
		    event.preventDefault();
		    if (yesFunc) yesFunc();
		    modal.destroy();
		});
		
		$(modal.content).on('click', '[name="NoBtn"]', function(event) {
		    event.stopPropagation();
		    event.preventDefault();
		    if (noFunc) noFunc();
		    modal.destroy();
		});
		
		modal.display(true);
	},
	
	deleteDialog(object, doDelete, callback) {
		const question = 'Are you sure?';
		const title = 'Confirmation';
		const user = User.getCurrent();
		var buttons = [];
		
		if (doDelete) {
			buttons.push(H.btn('Yes (Soft delete)', 'YesBtn1', cls='special big', null));
			if (user.isAdmin()) {
				buttons.push(H.btn('Attempt hard delete', 'YesBtn2', cls=' big', null));
			}
		} else {
			buttons.push(H.btn('Yes (Undelete)', 'YesBtn1', cls='big', null));
			if (user.isAdmin()) {
				buttons.push(H.btn('Attempt hard delete', 'YesBtn2', cls=' big', null));
			}
		}
		buttons.push(H.btn('No ', 'NoBtn',  cls='big', null));
		
		const content = `
			<div class='boldText'>${question}</div>
			<div class='buttons'>
				${buttons.join("")}
			</div>
		`;
		
		const modal = Modal.create('confirmDelete', {cls:'tiny'});
		
		$(modal.content).html(content);
		
		$(`[name='YesBtn1']`).focus();
		
		$(modal.title).html(title);
		
		$(modal.content).on('click', '[name="YesBtn1"]', function(event) {
		    event.stopPropagation();
		    event.preventDefault();
		    object.del(doDelete, false, callback);
		    modal.destroy();
		});
		
		$(modal.content).on('click', '[name="YesBtn2"]', function(event) {
		    event.stopPropagation();
		    event.preventDefault();
		    object.del(doDelete, true, callback);
		    modal.destroy();
		});
		
		$(modal.content).on('click', '[name="NoBtn"]', function(event) {
		    event.stopPropagation();
		    event.preventDefault();
		    modal.destroy();
		});
		
		modal.display(true);
	}
		
		
		
		
}