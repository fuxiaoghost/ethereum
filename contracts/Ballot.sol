pragma solidity ^0.4.18;
contract Ballot {
    // 投票人
    struct Voter {
        uint weight;
        bool voted;
        address delegate;
        uint vote;
    }
    // 投票
    struct Proposal {
        bytes32 name;
        uint voteCount;
    }

    // 主席
    address public chairperson;

    // 所有的投票人
    mapping(address => Voter) public voters;

    // 所有投票
    Proposal[] public proposals;

    // 初始化，构造函数
    function Ballot(bytes32[] proposalNames) {
        // 主席具有投票权
        chairperson = msg.sender;
        voters[chairperson].weight = 1;
        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }

    // 主席指定某个投票人具有投票权
    function giveRightToVote(address voter) {
        // 如果调用者为主席，并且投票人没有投过票，则给其赋予投票的权利
        require((msg.sender == chairperson) && !voters[voter].voted);
        voters[voter].weight = 1;
    }

    // 委托其他人投票
    function delegate(address to) {
        Voter sender = voters[msg.sender];
        require(!sender.voted); // 尚未投票
        require(to != msg.sender);  // 不能委托自己
        while (voters[to].delegate != address(0)) {
            // 如果还有委托，找到最终委托人
            to = voters[to].delegate;
            // 不能构成循环
            require(to != msg.sender);
        }
        sender.voted = true; // 自己标记已投票
        sender.delegate = to; // 委托

        Voter delegate = voters[to];
        if (delegate.voted) {
            // 如果被委托人已经投票，直接把自己的投票投给被委托人投的候选人
            proposals[delegate.vote].voteCount = sender.weight;
        }else {
            // 如果被委托人没有投票，把自己的投票交给被委托人
            delegate.weight += sender.weight;
        }
    }

    // 投票
    function vote(uint proposal) {
        Voter sender = voters[msg.sender];
        require(!sender.voted); // 尚未投票
        sender.voted = true;    
        sender.vote = proposal;
        proposals[proposal].voteCount += sender.weight;
    }

    // 找出最终的获胜者
    function winningProposal() constant returns (uint winningProposal) {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal = p;
            }
        }
    }

    // 得到获胜者的名字
    function winnerName() constant returns (bytes32 winnerName) {
        winnerName = proposals[winningProposal()].name;
    }
}