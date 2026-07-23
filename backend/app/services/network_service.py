from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.all_models import Accused, CaseMaster, CrimeHead
from app.schemas.network import GraphData, Node, Link

class NetworkService:
    @staticmethod
    def get_criminal_network(db: Session, limit: int = 50) -> GraphData:
        # 1. Identify repeat offenders
        repeat_offenders = (
            db.query(Accused.AccusedName)
            .group_by(Accused.AccusedName)
            .having(func.count(Accused.CaseMasterID) > 1)
            .limit(limit)
            .all()
        )
        
        offender_names = [r[0] for r in repeat_offenders]
        
        if not offender_names:
            return GraphData(nodes=[], links=[])

        # 2. Fetch cases + categories linked to repeat offenders
        accused_records = db.query(
            Accused, CaseMaster, CrimeHead
        ).join(
            CaseMaster, Accused.CaseMasterID == CaseMaster.CaseMasterID
        ).outerjoin(
            CrimeHead, CaseMaster.CrimeMajorHeadID == CrimeHead.CrimeHeadID
        ).filter(Accused.AccusedName.in_(offender_names)).all()

        nodes_dict = {}
        links = []

        # 3. Process into Nodes and Links
        for acc, case_rec, crime_head in accused_records:
            person_node_id = f"person_{acc.AccusedName}"
            case_node_id = f"case_{case_rec.CrimeNo}"

            # Add Person Node
            if person_node_id not in nodes_dict:
                nodes_dict[person_node_id] = Node(
                    id=person_node_id, 
                    name=acc.AccusedName, 
                    group="person", 
                    val=5
                )
            else:
                nodes_dict[person_node_id].val += 2 

            # Add Case Node (Now including Category and Date)
            if case_node_id not in nodes_dict:
                reg_date = case_rec.CrimeRegisteredDate.isoformat() if case_rec.CrimeRegisteredDate else None
                category_name = crime_head.CrimeGroupName if crime_head else "Unknown Category"
                
                nodes_dict[case_node_id] = Node(
                    id=case_node_id, 
                    name=case_rec.CrimeNo, 
                    group="case", 
                    val=3,
                    category=category_name,
                    date=reg_date
                )

            # Create the Link
            links.append(Link(source=person_node_id, target=case_node_id))

        return GraphData(
            nodes=list(nodes_dict.values()),
            links=links
        )

network_service = NetworkService()