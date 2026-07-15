type Props = React.SVGProps<SVGSVGElement>
const Icon = ({children, ...props}: Props) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>
export const Plus = () => <Icon><path d="M12 5v14M5 12h14"/></Icon>
export const Upload = () => <Icon><path d="M12 16V4m0 0L7 9m5-5 5 5M5 15v4h14v-4"/></Icon>
export const FileText = () => <Icon><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 13h6M9 17h6"/></Icon>
export const Users = () => <Icon><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></Icon>
export const Search = () => <Icon><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></Icon>
export const More = () => <Icon><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></Icon>
export const ArrowLeft = () => <Icon><path d="m15 18-6-6 6-6"/></Icon>
export const Share = () => <Icon><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/></Icon>
export const Trash = () => <Icon><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14"/></Icon>
export const Check = () => <Icon><path d="m5 12 4 4L19 6"/></Icon>
