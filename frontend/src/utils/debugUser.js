// Debug utility to check user data
export const debugUser = (user) => {
    console.log('=== USER DEBUG INFO ===');
    console.log('Full user object:', user);
    console.log('User roles:', user?.roles);
    console.log('User roles type:', typeof user?.roles);
    console.log('User roles length:', user?.roles?.length);
    console.log('First role:', user?.roles?.[0]);
    console.log('Has investor role:', user?.roles?.includes('investor'));
    console.log('Has landowner role:', user?.roles?.includes('landowner'));
    console.log('Has administrator role:', user?.roles?.includes('administrator'));
    console.log('Has re_sales_advisor role:', user?.roles?.includes('re_sales_advisor'));
    console.log('Has re_analyst role:', user?.roles?.includes('re_analyst'));
    console.log('Has re_governance_lead role:', user?.roles?.includes('re_governance_lead'));
    console.log('Has project_manager role:', user?.roles?.includes('project_manager'));
    console.log('========================');
};
