import * as React from 'react';
import { connect } from 'react-redux';
import {
  Card,
  Button,
  Tag,
  Icon,
  Tree,
  List,
  Popconfirm,
  Modal,
  Row,
  Col
} from 'antd';
import { FormattedMessage } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dispatch } from 'redux';

import * as styles from './styles.module.scss';
import { Omit } from '@/utils/types';
import { RootState, RootAction, RTDispatch } from '@/store/ducks';
import { clusterOperations } from '@/store/ducks/cluster';
import {
  networkModels,
  networkActions,
  networkOperations
} from '@/store/ducks/network';

import NetworkFrom from '@/components/NetworkForm';

const ListItem = List.Item;
const TreeNode = Tree.TreeNode;

interface NetworkRecord {
  key?: string | number;
  networkname: string;
  bridgename: string;
  node: Array<string>;
  type: string;
  physicalInterface: Array<string>;
  vlanTag: Array<string>;
}

interface NetworkState {
  isCreating: boolean;
  formDate?: {
    name: string;
  };
  dataSource: Array<NetworkRecord>;
}

interface NetworkProps {
  networks: Array<networkModels.Network>;
  fetchNodesWithNICs: () => any;
  deleteNetwork: (id: string) => any;
}

class Network extends React.Component<NetworkProps, NetworkState> {
  constructor(props: NetworkProps) {
    super(props);
    this.state = {
      isCreating: false,
      formDate: {
        name: ''
      },
      dataSource: []
    };
  }

  public componentDidMount() {
    this.props.fetchNodesWithNICs();
  }

  protected renderTags = (tags: Array<string | number>) => {
    return (
      <div className={styles.tags}>
        {tags.map(text => (
          <Tag className={styles.tag} key={text}>
            {text}
          </Tag>
        ))}
      </div>
    );
  };

  protected renderListItemAction = (id: string) => {
    return [
      <a href="javascript:;" key="action.edit">
        <FormattedMessage id="action.edit" />
      </a>,
      <Popconfirm
        key="action.delete"
        title={<FormattedMessage id="action.confirmToDelete" />}
        onConfirm={this.props.deleteNetwork.bind(this, id)}
      >
        <a href="javascript:;">
          <FormattedMessage id="action.delete" />
        </a>
      </Popconfirm>
    ];
  };

  protected renderListItemContent = (
    title: string | React.ReactNode,
    content: string | React.ReactNode
  ) => {
    return (
      <div className={styles.column}>
        <div className="title">{title}</div>
        <div className="content">{content}</div>
      </div>
    );
  };

  protected renderListItem = (item: networkModels.Network) => {
    const type =
      item.isDPDKPort && item.type === networkModels.dataPathType.netdev
        ? 'netdev with DPDK'
        : (item.type as string);
    return (
      <ListItem key={item.id} actions={this.renderListItemAction(item.id)}>
        <div className={styles.leading}>
          <h3 className="title" title={item.name}>
            {item.name}
          </h3>
          <span>{type}</span>
        </div>
        <div>
          {this.renderListItemContent(
            <FormattedMessage id={`network.bridgeName`} />,
            item.bridgeName
          )}
        </div>

        {this.renderListItemContent(
          <FormattedMessage id={`network.VLANTag`} />,
          item.VLANTags.length === 0 ? (
            <FormattedMessage id="network.noTrunk" />
          ) : (
            this.renderTags(item.VLANTags)
          )
        )}
      </ListItem>
    );
  };

  protected renderListItemExtra = (item: networkModels.Network) => {
    return this.renderListItemContent(
      <FormattedMessage id={`network.nodes`} />,
      item.nodes.length === 0 ? (
        <FormattedMessage id="network.noTrunk" />
      ) : (
        <Tree showIcon={true} selectable={false}>
          {item.nodes.map((node, idx) => (
            <TreeNode
              title={node.name}
              key={`${node.name}-${idx}`}
              icon={<FontAwesomeIcon icon="server" />}
            >
              {node.physicalInterface.map(physicalInterface => (
                <TreeNode
                  key={`${node.name}-${idx}-${physicalInterface.name}-${
                    physicalInterface.pciid
                  }`}
                  icon={<FontAwesomeIcon icon="server" />}
                  title={physicalInterface.name || physicalInterface.pciid}
                />
              ))}
            </TreeNode>
          ))}
        </Tree>
      )
    );
  };

  protected renderCreateModal = () => {
    return (
      <Modal
        visible={true}
        wrapClassName={styles.modal}
        title={<FormattedMessage id="network.createNewNetwork" />}
      >
        <NetworkFrom name={this.state.formDate!.name} />
      </Modal>
    );
  };

  public render() {
    return (
      <div>
        <Card title="Network">
          <List
            bordered={true}
            itemLayout="vertical"
            dataSource={this.props.networks}
            renderItem={this.renderListItem}
          />
          <Button type="dashed" className={styles.add}>
            <Icon type="plus" /> <FormattedMessage id="network.add" />
          </Button>
        </Card>
        {this.renderCreateModal()}
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    networks: state.network.networks
  };
};

const mapDispatchToProps = (dispatch: RTDispatch & Dispatch<RootAction>) => ({
  fetchNodesWithNICs: () => dispatch(clusterOperations.fetchNodesWithNICs()),
  deleteNetwork: (id: string) => dispatch(networkActions.deleteNetwork({ id }))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Network);
