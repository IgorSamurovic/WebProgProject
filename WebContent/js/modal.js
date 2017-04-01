Modal = {
		
	getPage : function(name, cls) {
		name = name + 'Modal';
		return `
			<div class='hidden modal' id='${name}'>
				<div class='modalWindow'>
				${H.page({
					name : name,
					cls : cls,
					canExit : true
				})}
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
	
	create : function(name, cls) {
		const modal = Object.create(this);

		// Set modal's properties
		modal.name = name;
		modal.container = `#${name}Modal`;
		modal.page      = `#${name}ModalPage`;
		modal.header    = `#${name}ModalPageHeader`;
		modal.title     = `#${name}ModalPageTitle`;
		modal.content   = `#${name}ModalPageContent`;
		
		// Add the hidden modal object to the page
		$('body').append(modal.getPage(name, cls));
		
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
				${H.btn('Yes', 'YesBtn', cls='big btn2', null)}
				${H.btn('No ', 'NoBtn',  cls='big btn', null)}
			</div>
		`;
		
		const modal = Modal.create('confirm', 'tiny');
		
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
	}
		
		
		
		
}