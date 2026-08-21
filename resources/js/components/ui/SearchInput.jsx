import { SearchIcon } from './icons';
import TextInput from './TextInput';

/**
 * Text input with a magnifier affordance — the merchant filter.
 */
export default function SearchInput(props) {
    return <TextInput type="search" leadingIcon={<SearchIcon />} {...props} />;
}
